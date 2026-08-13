import {
  Base,
  createContext,
  signal,
  withResize,
  type ChildrenCollection,
  type DelegatedEvent,
  type MountedReturn,
  type RefEvent,
  type Signal,
} from '../../src/index.js';
import { clamp } from '../../src/utils/maths.js';
import { SliderDrag } from './SliderDrag.js';
import { SliderItem } from './SliderItem.js';

export type SliderModes = 'left' | 'center' | 'right';

export interface SliderState {
  index: number;
  total: number;
}

/**
 * The surface a Slider exposes to its controls: state to read, commands to
 * call. Nothing else of the Slider is reachable through it.
 *
 * This replaces the per-instance `createStorage()` store of v3 and, with it,
 * the whole `AbstractSliderChild` handshake: no `connectChildren()` on the
 * parent, no `__connect()` on the child, no `updated()`/`resized()`
 * reconnection safety nets. It is resolved through the DOM event path, so
 * mount order does not matter in either direction.
 *
 * The commands are here because a control needs both halves and the state
 * signal is only one of them: v3's controls called `this.slider.goTo(index)`,
 * and a context carrying a `Signal` alone left them reaching back through
 * `$closest('Slider')` for that — which is the coupling the context exists to
 * remove, reintroduced. Provided verbatim, so this object is exactly what a
 * consumer resolves.
 */
export interface SliderApi {
  state: Signal<SliderState>;
  goTo(index: number): void;
  goNext(): void;
  goPrev(): void;
}

export const SliderContext = /* @__PURE__ */ createContext<SliderApi>('slider');

export interface SliderProps {
  $refs: { wrapper: HTMLElement };
  $options: {
    mode: SliderModes;
    fitBounds: boolean;
    contain: boolean;
    sensitivity: number;
    dropSensitivity: number;
  };
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
 * Port of @studiometa/ui 1.10's `Slider`.
 *
 * What changed, and why:
 *
 * - `$children.SliderItem` → `$watchChildren('SliderItem')`, so slides added
 *   or removed after mount are picked up.
 * - the index store → a provided owner surface (a `Signal` for what changes,
 *   methods for what a control may ask for), injected by the controls.
 * - `keyed()` (KeyService) → `onWrapperKeydown`, a delegated handler on the
 *   `wrapper` ref. The event only reaches the component when the focus is
 *   inside the wrapper, which is what v3 tracked by hand with
 *   `onWrapperFocus` / `onWrapperBlur` and a `hasFocus` flag.
 * - the drag handlers take v4's `DragProps`: flat per-axis fields, and a
 *   settle position the service works out itself — see `onSliderDragDrop`.
 */
export class Slider extends withResize(Base)<SliderProps> {
  static config = {
    name: 'Slider',
    refs: ['wrapper'],
    components: { SliderItem, SliderDrag },
    options: {
      mode: { type: String, default: 'left' },
      fitBounds: Boolean,
      contain: Boolean,
      sensitivity: { type: Number, default: 1 },
      dropSensitivity: { type: Number, default: 2 },
    },
  };

  state = signal<SliderState>({ index: 0, total: 0 });

  /**
   * The provided owner surface. The provider is attached in this field
   * initializer, so it answers a request from the moment the instance exists —
   * before `mounted()`, and before `$closest('Slider')` would find anything,
   * since that only reports a *mounted* ancestor.
   */
  api: SliderApi = this.$provide(SliderContext, {
    state: this.state,
    goTo: (index) => this.goTo(index),
    goNext: () => this.goNext(),
    goPrev: () => this.goPrev(),
  });

  items: ChildrenCollection<SliderItem> = this.$watchChildren<SliderItem>('SliderItem', {
    added: () => this.refresh(),
    removed: () => this.refresh(),
  });

  states: SliderItemState[] = [];

  origins: Record<SliderModes, number> = { left: 0, center: 0, right: 0 };

  #currentIndex = 0;

  /** Position the slides sat at when the current gesture started. */
  #initialX = 0;

  /** Position the slides are at right now, while a gesture is running. */
  #distanceX = 0;

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
   * A gesture started on the `SliderDrag` track: remember where the slides
   * are, so the drag is relative to it.
   */
  onSliderDragStart(): void {
    this.#initialX = this.currentSliderItem?.x ?? 0;
    this.#distanceX = this.#initialX;
  }

  /**
   * Follow the pointer. `props.distanceX` is v4's flat spelling of v3's
   * `props.distance.x` — the movement since the gesture started.
   */
  onSliderDragDrag({ args: [props] }: DelegatedEvent<SliderDrag, 'drag'>): void {
    this.#distanceX = this.#initialX + props.distanceX * this.$options.sensitivity;

    for (const item of this.items) {
      item.moveInstantly(this.#distanceX);
    }
  }

  /**
   * The gesture ended: pick the slide the throw was heading for.
   *
   * v3 projected the throw itself, with
   * `inertiaFinalValue(this.__distanceX, props.delta.x * dropSensitivity)` —
   * feeding a per-event delta into an inertia formula, which made the same
   * flick land differently on a 1000 Hz mouse and a 125 Hz trackpad. v4's drag
   * service has already done that work and done it properly: it samples a
   * velocity in pixels per millisecond and announces the exact settle position
   * as `finalX` at drop time. So the projection is the travel the service is
   * promising, `finalX - x`, and `dropSensitivity` keeps its meaning as the
   * multiplier over it.
   */
  onSliderDragDrop({ args: [props] }: DelegatedEvent<SliderDrag, 'drop'>): void {
    const first = this.states[0];
    const last = this.states.at(-1);
    if (!first || !last) {
      return;
    }

    const projected = (props.finalX - props.x) * this.$options.dropSensitivity;
    let finalX = clamp(
      this.#distanceX + projected,
      this.getStateValueByMode(first),
      this.getStateValueByMode(last),
    );

    const differences = this.states.map((state) =>
      Math.abs(finalX - this.getStateValueByMode(state)),
    );
    const closestIndex = differences.indexOf(Math.min(...differences));

    if (this.$options.fitBounds) {
      this.goTo(closestIndex);
      return;
    }

    if (this.$options.contain) {
      finalX = Math.min(this.containMinState, finalX);
      finalX = Math.max(this.containMaxState, finalX);
    }

    for (const item of this.items) {
      item.move(finalX);
    }

    // Deliberately not `goTo()`: the slides rest between two states, so only
    // the index is published. This is v3's behaviour, and it is why the
    // `currentIndex` setter is what publishes the state.
    this.currentIndex = closestIndex;
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
