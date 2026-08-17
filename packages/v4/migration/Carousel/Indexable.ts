import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { clamp, fold, wrap } from '../../src/utils/maths.js';
import { randomInt } from '../../src/utils/random.js';

/** Gap 10: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[Indexable]', ...args);
}

export const INDEXABLE_BOUNDARIES = Object.freeze({
  CLAMP: 'clamp',
  LOOP: 'loop',
  BOUNCE: 'bounce',
} as const);

export type IndexableBoundary = (typeof INDEXABLE_BOUNDARIES)[keyof typeof INDEXABLE_BOUNDARIES];

export const INDEXABLE_INSTRUCTIONS = Object.freeze({
  NEXT: 'next',
  PREVIOUS: 'previous',
  FIRST: 'first',
  LAST: 'last',
  RANDOM: 'random',
} as const);

export type IndexableInstruction =
  (typeof INDEXABLE_INSTRUCTIONS)[keyof typeof INDEXABLE_INSTRUCTIONS];

const BOUNDARY_VALUES: readonly string[] = Object.values(INDEXABLE_BOUNDARIES);

export type IndexableProps = BaseProps & {
  $options: {
    boundary: IndexableBoundary;
    reverse: boolean;
    total: number;
  };
  $emits: {
    index: { index: number };
  };
};

/**
 * Tracks a current index within a total, with configurable boundary behaviour
 * (`clamp`, `loop` or `bounce`).
 *
 * v3 ships this as a `withIndex(Base)` decorator wrapped by an `Indexable`
 * component. There is nothing left for the decorator to do here — it takes no
 * options and every consumer extends the wrapper — so the port is one class.
 * The one real change is forced: v3 keeps `isReverse` and `boundary` in
 * `$options` and **writes to them**, and `$options` is a read-only view over
 * attributes in v4 (gap 2). Both become private state seeded from the option,
 * which is what `AccordionItem.isOpen` had to become as well.
 */
export class Indexable<T extends BaseProps = BaseProps> extends Base<IndexableProps & T> {
  static config: BaseConfig = {
    name: 'Indexable',
    options: {
      boundary: {
        type: String,
        default: INDEXABLE_BOUNDARIES.CLAMP,
      },
      reverse: Boolean,
      total: {
        type: Number,
        default: 0,
      },
    },
  };

  #index = 0;

  #isReverse: boolean | null = null;

  #boundary: IndexableBoundary | null = null;

  get isReverse(): boolean {
    return this.#isReverse ?? this.$options.reverse === true;
  }

  set isReverse(value: boolean) {
    this.#isReverse = Boolean(value);
  }

  get boundary(): IndexableBoundary {
    const boundary = this.#boundary ?? this.$options.boundary;
    return BOUNDARY_VALUES.includes(boundary) ? boundary : INDEXABLE_BOUNDARIES.CLAMP;
  }

  set boundary(value: IndexableBoundary) {
    this.#boundary = BOUNDARY_VALUES.includes(value) ? value : INDEXABLE_BOUNDARIES.CLAMP;
  }

  /** Defaults to the `total` option; subclasses derive it from their content. */
  get length(): number {
    return this.$options.total;
  }

  get minIndex(): number {
    return 0;
  }

  get maxIndex(): number {
    return Math.max(this.length - 1, 0);
  }

  get currentIndex(): number {
    return this.#index;
  }

  set currentIndex(value: number) {
    const oldIndex = this.#index;
    this.#index = this.normalizeIndex(value);
    if (this.#index !== oldIndex) {
      this.$emit('index', { index: this.#index });
    }
  }

  get firstIndex(): number {
    return this.isReverse ? this.maxIndex : this.minIndex;
  }

  get lastIndex(): number {
    return this.isReverse ? this.minIndex : this.maxIndex;
  }

  /** `1` going forward, `-1` reversed. */
  get direction(): number {
    return this.isReverse ? -1 : 1;
  }

  get prevIndex(): number {
    return this.normalizeIndex(this.currentIndex - this.direction);
  }

  get nextIndex(): number {
    return this.normalizeIndex(this.currentIndex + this.direction);
  }

  /** Bring any value into range, following the current boundary. */
  normalizeIndex(value: number): number {
    switch (this.boundary) {
      case INDEXABLE_BOUNDARIES.BOUNCE:
        return fold(value, this.minIndex, this.maxIndex);
      case INDEXABLE_BOUNDARIES.LOOP:
        return this.loopIndex(value);
      default:
        return clamp(value, this.minIndex, this.maxIndex);
    }
  }

  /** Wrap within `0…length`, or `0` when there is no length to wrap in. */
  loopIndex(value: number): number {
    const { length } = this;

    if (!Number.isFinite(length) || length <= 0) {
      return 0;
    }

    return wrap(value, 0, length);
  }

  goTo(indexOrInstruction: number | IndexableInstruction): Promise<void> {
    if (typeof indexOrInstruction === 'string') {
      switch (indexOrInstruction) {
        case INDEXABLE_INSTRUCTIONS.NEXT:
          return this.goNext();
        case INDEXABLE_INSTRUCTIONS.PREVIOUS:
          return this.goPrev();
        case INDEXABLE_INSTRUCTIONS.FIRST:
          return this.goTo(this.firstIndex);
        case INDEXABLE_INSTRUCTIONS.LAST:
          return this.goTo(this.lastIndex);
        case INDEXABLE_INSTRUCTIONS.RANDOM:
          return this.goTo(randomInt(this.minIndex, this.maxIndex));
        default:
          warn('Invalid goto instruction.');
          return Promise.resolve();
      }
    }

    if (!Number.isFinite(indexOrInstruction)) {
      warn('Invalid goto index.');
      return Promise.resolve();
    }

    this.currentIndex = indexOrInstruction;
    return Promise.resolve();
  }

  goNext(): Promise<void> {
    return this.step(this.direction);
  }

  goPrev(): Promise<void> {
    return this.step(-this.direction);
  }

  /** One step, reflecting the travel direction at a bound with `bounce`. */
  step(direction: number): Promise<void> {
    if (this.boundary === INDEXABLE_BOUNDARIES.BOUNCE) {
      const tentative = this.currentIndex + direction;
      const reversed = tentative > this.maxIndex || tentative < this.minIndex;
      if (reversed) {
        this.isReverse = !this.isReverse;
      }
      return this.goTo(fold(tentative, this.minIndex, this.maxIndex));
    }
    return this.goTo(this.normalizeIndex(this.currentIndex + direction));
  }
}
