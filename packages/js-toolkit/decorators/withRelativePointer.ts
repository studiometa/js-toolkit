import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import type { PointerServiceProps } from '../services/index.js';
import { usePointer } from '../services/index.js';

export type RelativePointerDecoratorOptions = {
  target?: (this: Base, instance: Base) => HTMLElement;
};

export interface RelativePointerInterface extends BaseInterface {
  movedrelative?(props: PointerServiceProps): void;
}

/**
 * Add dragging capabilities to a component.
 */
export function withRelativePointer<S extends Base>(
  BaseClass: typeof Base,
  { target = (instance) => instance.$el }: RelativePointerDecoratorOptions = {},
): BaseDecorator<RelativePointerInterface, S> {
  /**
   * Class.
   */
  class WithRelativePointer<T extends BaseProps = BaseProps> extends BaseClass<T> {
    /**
     * Config.
     */
    static config: BaseConfig = {
      name: `${BaseClass.config.name}WithRelativePointer`,
      emits: ['movedrelative'],
    };

    /**
     * Class constructor.
     */
    constructor(element: HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        this.$services.register(
          'movedrelative',
          usePointer.bind(undefined, target.call(this, this)),
        );
        this.$services.enable('movedrelative');
      });

      this.$on('destroyed', () => {
        this.$services.disable('movedrelative');
        this.$services.unregister('movedrelative');
      });
    }
  }

  // @ts-ignore
  return WithRelativePointer;
}
