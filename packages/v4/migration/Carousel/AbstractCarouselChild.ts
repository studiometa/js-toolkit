import { type BaseConfig, type BaseProps } from '../../src/index.js';
import { AbstractCarouselComponent } from './AbstractCarouselComponent.js';
import { CarouselContext, type CarouselState } from './context.js';

/**
 * The shared base for the controls that must reflect the active index.
 *
 * This is the class the exercise exists to measure. v3 spends 139 lines on it:
 * an `__connect()` retried from `mounted()`, `resized()` **and** `updated()`
 * because none of the three is reliable alone, an `__unsubscribe` guard to make
 * the retries idempotent, a `store.has('index')` check so the callback never
 * runs against an unseeded carousel, and a `domScheduler.read`/`write` wrapper
 * around a subclass method that may or may not return a second callback.
 *
 * All of it is one awaited `$inject`: the context protocol replays to a pending
 * consumer when the provider mounts later, so there is no ordering to retry
 * against and no seeding to check.
 */
export class AbstractCarouselChild<T extends BaseProps = BaseProps> extends AbstractCarouselComponent<T> {
  static config: BaseConfig = {
    name: 'AbstractCarouselChild',
  };

  async mounted() {
    const { state } = await this.$inject(CarouselContext);
    return state.subscribe(
      (value) => {
        this.$write(() => this.update(value));
      },
      { immediate: true },
    );
  }

  /** Reflect the carousel's state. Subclasses implement it. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(state: CarouselState): void {}
}
