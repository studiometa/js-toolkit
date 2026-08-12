import {
  Base,
  createContext,
  Signal,
  withResize,
  type ChildrenCollection,
  type MountedReturn,
  type RefEvent,
} from '../../src/index.js';
import { SliderItem } from './SliderItem.js';

export type SliderModes = 'left' | 'center' | 'right';

export interface SliderState {
  index: number;
  total: number;
}

/**
 * The state a Slider publishes to its controls.
 *
 * This replaces the per-instance `createStorage()` store of v3 and, with it,
 * the whole `AbstractSliderChild` handshake: no `connectChildren()` on the
 * parent, no `__connect()` on the child, no `updated()`/`resized()`
 * reconnection safety nets. The signal is resolved through the DOM event
 * path, so mount order does not matter in either direction.
 */
export const SliderContext = /* @__PURE__ */ createContext<Signal<SliderState>>('slider-state');

export interface SliderProps {
  $refs: { wrapper: HTMLElement };
  $options: { mode: SliderModes; fitBounds: boolean; contain: boolean };
  $emits: { goto: [index: number]; index: [index: number] };
}

interface SliderItemState {
  left: number;
  center: number;
  right: number;
}

/**
 * Slider — the root of the carousel system.
 *
 * Port of @studiometa/ui 1.10's `Slider`, minus `SliderDrag` (which needs the
 * drag service and the inertia helper; v4 ships `useDrag`, so it is a
 * mechanical follow-up rather than a blocker).
 *
 * What changed, and why:
 *
 * - `$children.SliderItem` → `$watchChildren('SliderItem')`, so slides added
 *   or removed after mount are picked up.
 * - the index store → a provided `Signal`, injected by the controls.
 * - `keyed()` (KeyService) → `onWrapperKeydown`, a delegated handler on the
 *   `wrapper` ref. The event only reaches the component when the focus is
 *   inside the wrapper, which is what v3 tracked by hand with
 *   `onWrapperFocus` / `onWrapperBlur` and a `hasFocus` flag.
 */
export class Slider extends withResize(Base)<SliderProps> {
  static config = {
    name: 'Slider',
    refs: ['wrapper'],
    components: { SliderItem },
    options: {
      mode: { type: String, default: 'left' },
      fitBounds: Boolean,
      contain: Boolean,
    },
  };

  state: Signal<SliderState> = this.$provide(
    SliderContext,
    // Provided verbatim since v4 stopped wrapping: the coordinator decides
    // its own surface, and this one is a value cell.
    new Signal<SliderState>({ index: 0, total: 0 }),
  );

  items: ChildrenCollection<SliderItem> = this.$watchChildren<SliderItem>('SliderItem', {
    added: () => this.refresh(),
    removed: () => this.refresh(),
  });

  states: SliderItemState[] = [];

  origins: Record<SliderModes, number> = { left: 0, center: 0, right: 0 };

  #currentIndex = 0;

  get currentIndex(): number {
    return this.#currentIndex;
  }

  set currentIndex(value: number) {
    this.currentSliderItem?.disactivate();
    this.#currentIndex = value;
    this.$emit('index', value);
    this.state.value = { index: value, total: this.items.size };
    this.currentSliderItem?.activate();
  }

  get indexMax(): number {
    return this.items.size - 1;
  }

  get currentSliderItem(): SliderItem | undefined {
    return this.items.items[this.#currentIndex];
  }

  get containMinState(): number {
    return this.states[0]?.left ?? 0;
  }

  get containMaxState(): number {
    return this.states.at(-1)?.right ?? 0;
  }

  mounted(): MountedReturn {
    const inherited = super.mounted();
    this.$el.setAttribute('role', 'group');
    this.$el.setAttribute('aria-roledescription', 'carousel');
    this.refresh();
    return inherited;
  }

  /**
   * Re-measure and re-publish. v3 split this between `mounted()`,
   * `resized()` and `connectChildren()`; here one method answers every event
   * that can change the geometry or the slide count.
   */
  refresh(): void {
    this.$read(() => {
      this.states = this.getStates();
      this.$write(() => this.goTo(Math.min(this.#currentIndex, Math.max(0, this.indexMax))));
    });
  }

  resized(): void {
    this.refresh();
  }

  getStates(): SliderItemState[] {
    const items = this.items.items;
    if (items.length === 0) {
      return [];
    }

    const originRect = this.$refs.wrapper.getBoundingClientRect();
    this.origins = {
      left: originRect.left,
      center: originRect.left + originRect.width / 2,
      right: originRect.left + originRect.width,
    };

    const states: SliderItemState[] = items.map((item) => ({
      left: (item.rect.x - this.origins.left) * -1,
      center: (item.rect.x + item.rect.width / 2 - this.origins.center) * -1,
      right: (item.rect.x + item.rect.width - this.origins.right) * -1,
    }));

    if (!this.$options.contain) {
      return states;
    }

    const { mode } = this.$options;

    if (mode === 'left') {
      const lastItem = items.at(-1) as SliderItem;
      const maxState = states.find((state) => {
        const lastPosition = lastItem.rect.x - this.origins.left + lastItem.rect.width + state.left;
        const difference = originRect.width - lastPosition;
        if (difference > 0) {
          state.left = Math.min(state.left + difference, 0);
          return true;
        }
        return false;
      });

      if (maxState) {
        for (const state of states) {
          state.left = Math.max(state.left, maxState.left);
        }
      }
      return states;
    }

    if (mode === 'right') {
      const maxStateIndex = states.findIndex((state) => state.right <= 0);
      const maxState = maxStateIndex < 0 ? states.at(-1) : states[maxStateIndex - 1];
      for (const state of states) {
        state.right = maxStateIndex < 0 ? (maxState?.right ?? 0) : Math.min(state.right, 0);
      }
      return states;
    }

    // `center` + `contain` was never implemented in v3 either.
    console.warn('[Slider] The `center` mode is not compatible with the `contain` mode.');
    return states;
  }

  getStateValueByMode(state: SliderItemState, mode?: SliderModes): number {
    return state[mode ?? this.$options.mode];
  }

  goNext(): void {
    if (this.currentIndex + 1 <= this.indexMax) {
      this.goTo(this.currentIndex + 1);
    }
  }

  goPrev(): void {
    if (this.currentIndex - 1 >= 0) {
      this.goTo(this.currentIndex - 1);
    }
  }

  /**
   * v3 threw `Index out of bound.` here, which meant a slide removed from the
   * DOM could crash the slider. With a live children collection the index is
   * clamped instead — the collection is the source of truth and it changes
   * under the component by design.
   */
  goTo(index: number): void {
    if (this.items.size === 0) {
      this.currentIndex = 0;
      return;
    }

    const clamped = Math.max(0, Math.min(index, this.indexMax));
    const state = this.states[clamped];
    if (state) {
      const value = this.getStateValueByMode(state);
      for (const item of this.items) {
        item.move(value);
      }
    }

    this.currentIndex = clamped;
    this.$emit('goto', clamped);
  }

  /**
   * Arrow-key navigation. The handler is delegated from the `wrapper` ref, so
   * it only fires when the focus is inside the wrapper.
   */
  onWrapperKeydown({ event }: RefEvent): void {
    const { key } = event as KeyboardEvent;
    if (key === 'ArrowLeft') {
      this.goPrev();
    } else if (key === 'ArrowRight') {
      this.goNext();
    }
  }
}
