import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

export interface WithIntersectionObserverProps extends BaseProps {
  $options: {
    intersectionObserver: IntersectionObserverInit;
  };
  $observer: IntersectionObserver;
  intersected(entries: IntersectionObserverEntry[]): void;
}

export interface WithIntersectionObserverInterface extends BaseInterface {
  $observer: IntersectionObserver;
}

/**
 * Create an array of number between 0 and 1 from the given length.
 */
function createArrayOfNumber(length: number): number[] {
  return new Array(length + 1).fill(length).map((val, index) => index / length);
}

/**
 * IntersectionObserver decoration.
 */
export function withIntersectionObserver<S extends Base>(
  BaseClass: typeof Base,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions: IntersectionObserverInit = { threshold: createArrayOfNumber(100) },
): BaseDecorator<WithIntersectionObserverInterface, S, WithIntersectionObserverProps> {
  /**
   * Class.
   */
  class WithIntersectionObserver<T extends BaseProps = BaseProps> extends BaseClass<
    T & WithIntersectionObserverProps
  > {
    /**
     * Config
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      name: `${BaseClass.config.name}WithIntersectionObserver`,
      options: {
        ...(BaseClass.config?.options || {}),
        intersectionObserver: Object,
      },
      emits: ['intersected'],
    };

    /**
     * Intersection observer instance.
     */
    $observer: IntersectionObserver;

    /**
     * Create an observer when the class in instantiated.
     */
    constructor(element: HTMLElement) {
      super(element);

      this.$observer = new IntersectionObserver(
        (entries) => {
          this.__callMethod('intersected', entries);
        },
        {
          ...defaultOptions,
          ...(this.$options.intersectionObserver as IntersectionObserverInit),
        },
      );

      this.$on('mounted', () => {
        this.$observer.observe(this.$el);
      });

      this.$on('destroyed', () => {
        this.$observer.unobserve(this.$el);
      });
    }
  }

  // @ts-ignore
  return WithIntersectionObserver;
}
