import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import type { DragServiceOptions, DragServiceProps } from '../services/drag.js';
import { useDrag } from '../services/index.js';

export type DragDecoratorOptions = DragServiceOptions & {
  target?: (this: Base, instance: Base) => HTMLElement;
};

export interface WithDragInterface extends BaseInterface {
  dragged?(props:DragServiceProps):void;
}

/**
 * Add dragging capabilities to a component.
 */
export function withDrag<S extends Base>(
  BaseClass: typeof Base,
  { target = (instance) => instance.$el, ...options }: DragDecoratorOptions = {},
): BaseDecorator<BaseInterface, S> {
  /**
   * Class.
   */
  class WithDrag<T extends BaseProps = BaseProps> extends BaseClass<T & WithDragInterface> {
    /**
     * Config.
     */
    static config: BaseConfig = {
      name: `${BaseClass.config.name}WithDrag`,
      emits: ['dragged'],
    };

    /**
     * Class constructor.
     */
    constructor(element:HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        this.$services.register(
          'dragged',
          useDrag.bind(undefined, target.call(this, this), options),
        );
        this.$services.enable('dragged');
      });

      this.$on('destroyed', () => {
        this.$services.disable('dragged');
        this.$services.unregister('dragged');
      });
    }
  }

  // @ts-ignore
  return WithDrag;
}
