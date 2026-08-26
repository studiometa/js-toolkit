import { createContext, type Signal } from '../../src/index.js';
import type { IndexableInstruction } from './Indexable.js';
import type { ScrollPosition } from './utils.js';

/** What every Carousel control reads. */
export interface CarouselState {
  index: number;
  total: number;
  prevIndex: number;
  nextIndex: number;
  isHorizontal: boolean;
}

/**
 * The surface a `Carousel` exposes to its children.
 *
 * It is a curated object rather than the instance, so no control imports the
 * `Carousel` class — the shape §4c of the report calls the one every control
 * should have. `indexOf` takes an **element** for the same reason: an item
 * asking for its own position must not have to name a class to do it.
 */
export interface CarouselApi {
  state: Signal<CarouselState>;
  goTo(indexOrInstruction: number | IndexableInstruction): void;
  goNext(): void;
  goPrev(): void;
  /** The item's position among its siblings, or `-1`. */
  indexOf(element: Element): number;
  /** The centred scroll offset of every item, in DOM order. */
  positions(): ScrollPosition[];
  /** Report an index reached by scrolling. Never scrolls back. */
  reportIndex(index: number): void;
  /** Ask the carousel to keep publishing its progress. */
  keepTicking(): void;
}

export const CarouselContext = /* @__PURE__ */ createContext<CarouselApi>('carousel');
