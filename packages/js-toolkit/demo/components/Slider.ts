import {
  Base,
  createContext,
  signal,
  useScroll,
  type DelegatedEvent,
  type Signal,
} from '../../src/index.js';

/**
 * Slider-lite — a reimplementation of the @studiometa/ui Slider family on
 * the v4 model. This is the component whose `createStorage` store and
 * two-sided `connectChildren`/`__connect` handshake motivated the whole
 * data-sharing design: here the shared state and the commands travel through
 * one provided owner surface.
 *
 * - Scrolling uses native CSS scroll-snap + `scrollIntoView` — no math.
 * - `Slider` provides `{ state, goTo, goToItem }` through `SliderContext`:
 *   a `Signal` for what changes, methods for what a control may ask for.
 * - `SliderCount` injects the surface and subscribes to `state`: mount order
 *   does not matter, no handshake, no declaration.
 * - `SliderItem` calls `goToItem()` on click through `$injectSync` — a
 *   command surface instead of a `$closest('Slider')` reach-back.
 * - `SliderBtn` emits a bubbling `slide` event; `Slider` catches it through
 *   delegation (`onSliderBtnSlide`). Both directions are legitimate: an
 *   event says "this happened", a command says "do this".
 * - `SliderItem`s are tracked with `$watchChildren`: add or remove a slide
 *   in the DOM and the count updates.
 */
export interface SliderState {
  index: number;
  total: number;
}

/**
 * The curated surface the coordinator exposes — state to read, commands to
 * call. Nothing else of the `Slider` is reachable through it.
 */
export interface SliderApi {
  state: Signal<SliderState>;
  goTo(index: number): void;
  goToItem(item: SliderItem): void;
}

export const SliderContext = createContext<SliderApi>('slider');

export class SliderItem extends Base {
  static config = { name: 'SliderItem' };

  // A click must be answered now, so the surface is resolved synchronously:
  // no provider above means no slider to drive, and nothing happens.
  onClick(): void {
    this.$injectSync(SliderContext)?.goToItem(this);
  }
}

export class SliderBtn extends Base<{
  $el: HTMLButtonElement;
  $options: { direction: number };
  $emits: { slide: { direction: number } };
}> {
  static config = {
    name: 'SliderBtn',
    options: { direction: { type: Number, default: 1 } },
  };

  onClick(): void {
    this.$emit('slide', { direction: this.$options.direction });
  }
}

export class SliderCount extends Base<{ $el: HTMLSpanElement }> {
  static config = { name: 'SliderCount' };

  async mounted() {
    const { state } = await this.$inject(SliderContext);
    return state.subscribe(
      ({ index, total }) => {
        this.$write(() => {
          this.$el.textContent = total > 0 ? `${index + 1} / ${total}` : '–';
        });
      },
      { immediate: true },
    );
  }
}

export class Slider extends Base<{
  $refs: { wrapper: HTMLElement };
}> {
  static config = {
    name: 'Slider',
    refs: ['wrapper'],
    components: { SliderItem, SliderBtn, SliderCount },
  };

  index = 0;

  // The owner surface: one reactive Signal plus the commands a control is
  // allowed to call. Provided verbatim, so a consumer gets this object and
  // nothing more of the coordinator.
  api = this.$provide<SliderApi>(SliderContext, {
    state: signal<SliderState>({ index: 0, total: 0 }),
    goTo: (index) => this.goTo(index),
    goToItem: (item) => {
      const index = this.items.items.indexOf(item);
      if (index >= 0) {
        this.goTo(index);
      }
    },
  });

  items = this.$watchChildren<SliderItem>('SliderItem', {
    added: () => this.refresh(),
    removed: () => this.refresh(),
  });

  /**
   * Index a button navigation is scrolling toward. While set, scroll-driven
   * syncs are ignored so the smooth-scroll animation does not fight the
   * already-updated count; reaching it, or the scroll settling, clears it.
   */
  #navigationTarget: number | null = null;

  // The wrapper is its own scroll container, which is what `useScroll`
  // takes a target for. The service coalesces the events into one read per
  // frame and reports `isScrolling`, so there is nothing to bind, nothing
  // to debounce, and no `scrollend` handling of our own.
  mounted() {
    return useScroll(this.$refs.wrapper).subscribe(({ isScrolling }) => {
      if (!isScrolling) {
        this.#navigationTarget = null;
      }
      this.syncFromScroll();
    });
  }

  /**
   * Derive the current index from the scroll position: one frame-aligned
   * `$read` per frame (each scroll event cancels the previous pending task),
   * measuring which item sits closest to the wrapper center. Keeps the signal
   * in sync for native scroll-snap swipes, not only for the buttons.
   */
  syncFromScroll(): void {
    this.$read(() => {
      // Rects, not offsetLeft: offsets are relative to the positioned
      // ancestor (the page), not to the scroll wrapper.
      const wrapperRect = this.$refs.wrapper.getBoundingClientRect();
      const center = wrapperRect.left + wrapperRect.width / 2;
      let closest = this.index;
      let minDistance = Number.POSITIVE_INFINITY;
      this.items.items.forEach((item, index) => {
        const rect = item.$el.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < minDistance) {
          minDistance = distance;
          closest = index;
        }
      });
      if (this.#navigationTarget !== null) {
        if (closest !== this.#navigationTarget) {
          // Mid-animation measurement: the count already shows the target.
          return;
        }
        this.#navigationTarget = null;
      }
      if (closest !== this.index) {
        this.index = closest;
        this.update();
      }
    });
  }

  /**
   * The items changed (initial mount included): publish the new total right
   * away, then re-derive the index from the actual scroll position — the
   * browser restores it across reloads, and slides may appear or disappear
   * anywhere relative to the current one.
   */
  refresh(): void {
    this.update();
    this.syncFromScroll();
  }

  update(): void {
    const total = this.items?.size ?? 0;
    this.index = Math.min(this.index, Math.max(0, total - 1));
    this.api.state.value = { index: this.index, total };
  }

  // Naming the event types `payload` from SliderBtn's own `$emits`.
  onSliderBtnSlide({ payload: { direction } }: DelegatedEvent<SliderBtn, 'slide'>): void {
    this.goTo(this.index + direction);
  }

  goTo(index: number): void {
    const items = this.items.items;
    if (items.length === 0) {
      return;
    }
    this.index = Math.max(0, Math.min(index, items.length - 1));
    this.#navigationTarget = this.index;
    items[this.index].$el.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    this.update();
  }
}
