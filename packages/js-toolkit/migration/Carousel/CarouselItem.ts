import { component, type BaseProps } from '../../src/index.js';
import { AbstractCarouselChild } from './AbstractCarouselChild.js';
import type { CarouselState } from './context.js';

/**
 * One slide.
 *
 * v3 also owns its scroll target here, as a cached `compute-scroll-into-view`
 * call invalidated from `resized()` and `updated()`. That measurement needs the
 * scroller **and** the item, and the coordinator is the only place that has
 * both, so it moved to `Carousel.positions()` — one cache instead of one per
 * slide, invalidated in one place.
 */
@component({
  name: 'CarouselItem',
})
export class CarouselItem<T extends BaseProps = BaseProps> extends AbstractCarouselChild<T> {
  /** This item's position among its siblings, or `-1` outside a carousel. */
  get index(): number {
    return this.carousel?.indexOf(this.$el) ?? -1;
  }

  update({ index }: CarouselState): void {
    this.$el.style.setProperty('--carousel-item-active', String(Number(this.index === index)));
  }
}
