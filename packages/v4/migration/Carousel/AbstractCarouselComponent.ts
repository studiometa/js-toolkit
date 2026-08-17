import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { CarouselContext, type CarouselApi } from './context.js';

/**
 * The shared, non-subscribing base for every Carousel child.
 *
 * v3 resolves its parent through a `__carousel` field the Carousel hands over
 * in `connectChildren()`, falling back to a guarded `$closest('Carousel')`.
 * Both halves of that handshake are one `$injectSync(CarouselContext)` here,
 * memoised for the mount cycle because a v4 move re-resolves.
 *
 * Components that only read the carousel — the wrapper and the drag track —
 * extend this directly; controls that must react to the index extend
 * `AbstractCarouselChild`.
 */
export class AbstractCarouselComponent<T extends BaseProps = BaseProps> extends Base<T> {
  static config: BaseConfig = {
    name: 'AbstractCarouselComponent',
  };

  #carousel: CarouselApi | undefined;

  /** The carousel this component belongs to, or `undefined` outside one. */
  get carousel(): CarouselApi | undefined {
    return (this.#carousel ??= this.$injectSync(CarouselContext));
  }

  /** Defaults to horizontal, as v3 does, when there is no carousel yet. */
  get isHorizontal(): boolean {
    return this.carousel?.state.value.isHorizontal ?? true;
  }

  get isVertical(): boolean {
    return !this.isHorizontal;
  }

  destroyed(): void {
    this.#carousel = undefined;
  }
}
