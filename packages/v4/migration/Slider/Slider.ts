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

/** State and navigation commands exposed to Slider controls. */
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
  $emits: { goto: { index: number }; index: { index: number } };
}

interface SliderItemState {
  left: number;
  center: number;
  right: number;
}

/** Root carousel component with live slides, controls, and optional drag support. */
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

  /** Provided during construction so controls can resolve it before mount. */
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

  #initialX = 0;

  #distanceX = 0;

  get currentIndex(): number {
    return this.#currentIndex;
  }

  set currentIndex(value: number) {
    this.currentSliderItem?.disactivate();
    this.#currentIndex = value;
    this.$emit('index', { index: value });
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

  /** Re-measure geometry and publish the current state. */
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

  /** Navigate to an index clamped to the live slide collection. */
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
    this.$emit('goto', { index: clamped });
  }

  /** Capture the slide position at the start of a drag. */
  onSliderDragStart(): void {
    this.#initialX = this.currentSliderItem?.x ?? 0;
    this.#distanceX = this.#initialX;
  }

  /** Follow the pointer relative to the gesture start. */
  onSliderDragDrag({ payload: props }: DelegatedEvent<SliderDrag, 'drag'>): void {
    this.#distanceX = this.#initialX + props.distanceX * this.$options.sensitivity;

    for (const item of this.items) {
      item.moveInstantly(this.#distanceX);
    }
  }

  /** Select the closest slide using the drag service's projected settle position. */
  onSliderDragDrop({ payload: props }: DelegatedEvent<SliderDrag, 'drop'>): void {
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

    // Without `fitBounds`, publish the index without snapping slide positions.
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
