import { Base, createContext, type DelegatedEvent, type ScheduledTask } from '../../src/index';

/**
 * Slider-lite — a reimplementation of the @studiometa/ui Slider family on
 * the v4 model. This is the component whose `createStorage` store and
 * two-sided `connectChildren`/`__connect` handshake motivated the whole
 * data-sharing design: here the shared state is one provided reactive cell.
 *
 * - Scrolling uses native CSS scroll-snap + `scrollIntoView` — no math.
 * - `Slider` provides `{ index, total }` through `SliderContext`.
 * - `SliderCount` injects the cell and subscribes: mount order does not
 *   matter, no handshake, no declaration.
 * - `SliderBtn` emits a bubbling `slide` event; `Slider` catches it through
 *   delegation (`onSliderBtnSlide`).
 * - `SliderItem`s are tracked with `$watchChildren`: add or remove a slide
 *   in the DOM and the count updates.
 */
export interface SliderState {
  index: number;
  total: number;
}

export const SliderContext = createContext<SliderState>('slider-state');

export class SliderItem extends Base {
  static config = { name: 'SliderItem' };
}

export class SliderBtn extends Base {
  static config = {
    name: 'SliderBtn',
    options: { direction: { type: Number, default: 1 } },
  };

  onClick(): void {
    this.$emit('slide', this.$options.direction);
  }
}

export class SliderCount extends Base {
  static config = { name: 'SliderCount' };

  async mounted() {
    const state = await this.$inject(SliderContext);
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

export class Slider extends Base {
  static config = {
    name: 'Slider',
    refs: ['wrapper'],
    components: { SliderItem, SliderBtn, SliderCount },
  };

  index = 0;

  state = this.$provide(SliderContext, { index: 0, total: 0 });

  items = this.$watchChildren<SliderItem>('SliderItem', {
    added: () => this.refresh(),
    removed: () => this.refresh(),
  });

  #scrollRead: ScheduledTask<void> | null = null;

  /**
   * Index a button navigation is scrolling toward. While set, scroll-driven
   * syncs are ignored so the smooth-scroll animation does not fight the
   * already-updated count; the target measurement (or `scrollend`) clears it.
   */
  #navigationTarget: number | null = null;

  get wrapper(): HTMLElement {
    return this.$refs.wrapper as HTMLElement;
  }

  // `scroll` does not bubble, so the wrapper listener is bound per mount
  // cycle — the returned cleanup removes it on destroy.
  mounted() {
    const { wrapper } = this;
    const onScroll = () => this.syncFromScroll();
    const onScrollEnd = () => {
      this.#navigationTarget = null;
      this.syncFromScroll();
    };
    wrapper.addEventListener('scroll', onScroll, { passive: true });
    wrapper.addEventListener('scrollend', onScrollEnd);
    return () => {
      wrapper.removeEventListener('scroll', onScroll);
      wrapper.removeEventListener('scrollend', onScrollEnd);
    };
  }

  /**
   * Derive the current index from the scroll position: one frame-aligned
   * `$read` per frame (each scroll event cancels the previous pending task),
   * measuring which item sits closest to the wrapper center. Keeps the cell
   * in sync for native scroll-snap swipes, not only for the buttons.
   */
  syncFromScroll(): void {
    this.#scrollRead?.cancel();
    this.#scrollRead = this.$read(() => {
      // Rects, not offsetLeft: offsets are relative to the positioned
      // ancestor (the page), not to the scroll wrapper.
      const wrapperRect = this.wrapper.getBoundingClientRect();
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
    this.state.value = { index: this.index, total };
  }

  onSliderBtnSlide({ args }: DelegatedEvent<SliderBtn>): void {
    const [direction] = args as [number];
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
