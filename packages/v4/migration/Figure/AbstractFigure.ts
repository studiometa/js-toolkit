import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { loadImage } from '../../src/utils/load.js';
import { TRANSITION_OPTIONS } from '../../src/utils/transition.js';
import { withTransition, type TransitionProps } from '../Transition/index.js';

/** Gap: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[Figure]', ...args);
}

export type AbstractFigureProps = BaseProps &
  TransitionProps & {
    $refs: { img: HTMLImageElement };
    $options: TransitionProps['$options'] & { lazy: boolean };
    $emits: TransitionProps['$emits'] & { load: void };
  };

/**
 * Shared base for the image figure components. It implements
 * `withTransition` around a single `img` ref and, through the `in-view`
 * mount strategy, defers loading of the `data-src` source until the element
 * enters the viewport when the `lazy` option is set, running the enter
 * transition and emitting `load` once the image is ready.
 *
 * v3 mixed `withMountWhenInView` onto `Transition`, whose transition half is
 * now `withTransition` here. The `target` override is the whole reason the
 * mixin has one: the transition runs on the image, not on the root.
 */
export class AbstractFigure<T extends BaseProps = BaseProps> extends withTransition(Base)<
  AbstractFigureProps & T
> {
  static config: BaseConfig = {
    name: 'AbstractFigure',
    refs: ['img'],
    mountStrategy: 'in-view',
    options: {
      ...TRANSITION_OPTIONS,
      lazy: Boolean,
    },
  };

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
