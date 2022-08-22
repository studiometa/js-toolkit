import type { BaseConstructor, BaseTypeParameter } from '../Base/index.js';

interface WithIntersectionObserverInterface {
  $options: {
    intersectionObserver: IntersectionObserverInit;
  };
  $observer: IntersectionObserver;
  intersected(entries: IntersectionObserverEntry[]): void;
}

/**
 * Create an array of number between 0 and 1 from the given length.
 */
function createArrayOfNumber(length: number): number[] {
  return [...new Array(length + 1)].map((val, index) => index / length);
}

/**
 * IntersectionObserver decoration.
 */
export default function withIntersectionObserver<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: BaseConstructor,
  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  defaultOptions: IntersectionObserverInit = { threshold: createArrayOfNumber(100) }
) {
  return class WithIntersectionObserver<
    U extends BaseTypeParameter = BaseTypeParameter
  > extends BaseClass<WithIntersectionObserverInterface & T & U> {
    static config = {
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
          ...this.$options.intersectionObserver,
        }
      );

      this.$on('mounted', () => {
        this.$observer.observe(this.$el);
      });

      this.$on('destroyed', () => {
        this.$observer.unobserve(this.$el);
      });
    }
  };
}
