import { type BaseConfig, type BaseProps } from '../../src/index.js';
import { AbstractCarouselChild } from './AbstractCarouselChild.js';
import type { CarouselState } from './context.js';

export type CarouselBtnProps = BaseProps & {
  $el: HTMLButtonElement;
  $options: {
    action: string;
  };
};

/** A `next`, `prev` or numeric navigation button. */
export class CarouselBtn<T extends BaseProps = BaseProps> extends AbstractCarouselChild<
  CarouselBtnProps & T
> {
  static config: BaseConfig = {
    name: 'CarouselBtn',
    options: { action: String },
  };

  onClick(): void {
    const { carousel } = this;
    if (!carousel) {
      return;
    }

    const { action } = this.$options;
    switch (action) {
      case 'next':
        carousel.goNext();
        break;
      case 'prev':
        carousel.goPrev();
        break;
      default:
        carousel.goTo(Number(action));
        break;
    }
  }

  /**
   * Disable the button when its action would not move the index.
   *
   * `prevIndex`/`nextIndex` already encode the `boundary` and `reverse`
   * options, so `loop` and `bounce` never disable an end and `reverse` flips
   * which end is terminal. They travel on the state rather than being read off
   * the coordinator, which is the whole reason no control imports its class.
   */
  update({ index, prevIndex, nextIndex }: CarouselState): void {
    const { action } = this.$options;

    let shouldDisable: boolean;
    if (action === 'next') {
      shouldDisable = nextIndex === index;
    } else if (action === 'prev') {
      shouldDisable = prevIndex === index;
    } else {
      shouldDisable = Number(action) === index;
    }

    this.$el.disabled = shouldDisable;
  }
}
