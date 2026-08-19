import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadImage } from '../../src/utils/load.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';
import type { Transitionable } from '../Transition/index.js';

/** Gap: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[Figure]', ...args);
}

export type AbstractFigureProps = BaseProps & {
  $refs: { img: HTMLImageElement };
  $options: TransitionOptions & { lazy: boolean };
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
    load: void;
  };
};

/**
 * Shared base for the image figure components. It implements
 * `Transitionable` around a single `img` ref and, through the `in-view`
 * mount strategy, defers loading of the `data-src` source until the element
 * enters the viewport when the `lazy` option is set, running the enter
 * transition and emitting `load` once the image is ready.
 *
 * v3 mixed `withMountWhenInView` onto `Transition`; v4's ported `Transition`
 * is a plain, non-generic `Base` subclass rather than a mixin (the same
 * reason `MenuList` implements `Transitionable` directly instead of
 * extending it), so this does too — `enter()`/`leave()` below are otherwise
 * unchanged from `Transition`'s own.
 */
export class AbstractFigure<T extends BaseProps = BaseProps>
  extends Base<AbstractFigureProps & T>
  implements Transitionable
{
  static config: BaseConfig = {
    name: 'AbstractFigure',
    refs: ['img'],
    mountStrategy: 'in-view',
    options: {
      ...TRANSITION_OPTIONS,
      lazy: Boolean,
    },
  };

  state: 'entering' | 'leaving' | null = null;

  get target(): HTMLElement {
    return this.$refs.img;
  }

  get src(): string {
    return this.$refs.img.src;
  }

  set src(value: string) {
    this.$refs.img.src = value;
  }

  get original(): string {
    return this.$refs.img.dataset.src ?? '';
  }

  async enter(): Promise<void> {
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    await enterTransition(this.target, this.$options);
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    await leaveTransition(this.target, this.$options);
    this.$emit('transition-leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }

  /** Load on mount. */
  async mounted(): Promise<void> {
    const { img } = this.$refs;

    if (!img || !(img instanceof HTMLImageElement)) {
      warn('The `img` ref is missing or not an `<img>` element.');
      return;
    }

    const src = this.original;

    if (this.$options.lazy && src && src !== this.src) {
      try {
        await loadImage(src);
      } catch {
        warn(`Failed to load image "${src}".`);
        return;
      }

      this.src = src;
      void this.enter();
      this.$emit('load');
    }
  }
}
