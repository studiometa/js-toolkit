import {
  children,
  component,
  nextFrame,
  provide,
  signal,
  withRaf,
  withResize,
  type ChildrenCollection,
  type MountedReturn,
} from '../../src/index.js';
import { CarouselBtn } from './CarouselBtn.js';
import { CarouselDrag } from './CarouselDrag.js';
import { CarouselItem } from './CarouselItem.js';
import { CarouselWrapper } from './CarouselWrapper.js';
import { CarouselContext, type CarouselApi, type CarouselState } from './context.js';
import { Indexable, type IndexableInstruction, type IndexableProps } from './Indexable.js';
import { centeredScrollPosition, type ScrollPosition } from './utils.js';

export type CarouselProps = IndexableProps & {
  $options: IndexableProps['$options'] & {
    axis: 'x' | 'y';
  };
  $emits: IndexableProps['$emits'] & {
    progress: { progress: number };
  };
};

/**
 * The coordinator: a scroll-snapping carousel with live slides, navigation
 * buttons, an optional drag track and a published progress value.
 *
 * The shape is the one the `Slider` port arrived at. State and commands travel
 * on one provided object, so no control imports this class; the slides and the
 * wrapper are live `$watchChildren` collections, so adding or removing a slide
 * needs no `$update()`; and the geometry lives here, because this is the only
 * place that knows both the scroller and the item list.
 */
@component({
  name: 'Carousel',
  components: { CarouselBtn, CarouselDrag, CarouselItem, CarouselWrapper },
  options: {
    axis: { type: String, default: 'x' },
  },
})
export class Carousel extends withResize(withRaf(Indexable, { manual: true }))<CarouselProps> {
  state = signal<CarouselState>({
    index: 0,
    total: 0,
    prevIndex: 0,
    nextIndex: 0,
    isHorizontal: true,
  });

  /**
   * The exposed surface. Provided from a field initializer, so it answers a
   * child's `$injectSync` from the moment the instance exists — which is what
   * replaces v3's `connectChildren()` handshake entirely.
   */
  @provide(CarouselContext)
  api: CarouselApi = {
    state: this.state,
    goTo: (indexOrInstruction) => {
      void this.goTo(indexOrInstruction);
    },
    goNext: () => {
      void this.goNext();
    },
    goPrev: () => {
      void this.goPrev();
    },
    indexOf: (element) => this.items.items.findIndex((item) => item.$el === element),
    positions: () => this.positions,
    reportIndex: (index) => {
      this.currentIndex = index;
    },
    keepTicking: () => {
      this.$services.ticked.start();
    },
  };

  // The host of the callbacks is `any` unless it is named, and naming it is
  // what lets them read `this` under type-aware linting.
  @children<typeof CarouselItem, Carousel>(CarouselItem, {
    added() {
      this.itemsChanged();
    },
    removed() {
      this.itemsChanged();
    },
  })
  items!: ChildrenCollection<CarouselItem>;

  @children(CarouselWrapper)
  wrappers!: ChildrenCollection<CarouselWrapper>;

  previousProgress = -1;

  /** The centred scroll offset of every slide, measured once per change. */
  #positions: ScrollPosition[] | null = null;

  get isHorizontal(): boolean {
    return !this.isVertical;
  }

  get isVertical(): boolean {
    return this.$options.axis === 'y';
  }

  /** The slide count, which is what `Indexable` normalises against. */
  get length(): number {
    return this.items.size;
  }

  get wrapper(): CarouselWrapper | undefined {
    return this.wrappers.items[0];
  }

  get progress(): number {
    return this.wrapper?.progress ?? 0;
  }

  get positions(): ScrollPosition[] {
    const scroller = this.wrapper?.$el;

    if (!scroller) {
      return [];
    }

    this.#positions ??= this.items.items.map((item) => centeredScrollPosition(item.$el, scroller));

    return this.#positions;
  }

  get currentIndex(): number {
    return super.currentIndex;
  }

  /**
   * Set the index and publish it.
   *
   * `super` runs first so the boundary normalisation lands before anything
   * reads the value back. Assigning the index only reports state — it never
   * scrolls the wrapper. That separation is what lets `onScroll` report the
   * scroll-synced index without forming a scroll/index feedback loop.
   */
  set currentIndex(value: number) {
    super.currentIndex = value;
    this.publish();
  }

  mounted(): MountedReturn {
    void this.goTo(this.currentIndex);
    this.publish();
    return [
      super.mounted(),
      () => {
        this.#positions = null;
        this.previousProgress = -1;
      },
    ];
  }

  /**
   * Re-measure and re-snap after a viewport change.
   *
   * v3 defers by one frame so the children invalidate their own geometry
   * caches first — they each held one, and the parent's resize callback ran
   * before theirs. There is one cache now and it belongs here, so the frame is
   * only still needed for the layout the resize itself is about to produce.
   */
  resized(): void {
    this.#positions = null;
    this.wrapper?.invalidate();
    void nextFrame().then(() => {
      if (this.$isMounted) {
        void this.goTo(this.currentIndex);
      }
    });
  }

  /**
   * A slide arrived or left.
   *
   * v3 does this from `updated()`, which a consumer had to call. Re-assigning
   * the index re-normalises it against the new count — removing slides can
   * leave `currentIndex` past the end with no slide active — and the progress
   * denominator changed, so the loop is restarted to republish it.
   */
  itemsChanged(): void {
    this.#positions = null;
    this.wrapper?.invalidate();
    // Re-run the setter so the boundary re-normalises against the new count.
    // oxlint-disable-next-line no-self-assign
    this.currentIndex = this.currentIndex;
    this.previousProgress = -1;
    this.$services.ticked.start();
  }

  goTo(indexOrInstruction: number | IndexableInstruction): Promise<void> {
    this.$services.ticked.start();
    const result = super.goTo(indexOrInstruction);
    // Instructions recurse into a numeric `goTo`, which owns the scroll, so
    // guarding here avoids scrolling twice per instruction.
    if (typeof indexOrInstruction === 'number') {
      this.wrapper?.scrollToIndex(this.currentIndex);
    }
    return result;
  }

  ticked(): void {
    if (this.progress !== this.previousProgress) {
      this.previousProgress = this.progress;
      this.$emit('progress', { progress: this.progress });
      this.$el.style.setProperty('--carousel-progress', String(this.progress));
    } else {
      this.$services.ticked.stop();
    }
  }

  /** Publish the whole state, so a control never has to ask for a second value. */
  publish(): void {
    this.state.value = {
      index: this.currentIndex,
      total: this.length,
      prevIndex: this.prevIndex,
      nextIndex: this.nextIndex,
      isHorizontal: this.isHorizontal,
    };
  }
}
