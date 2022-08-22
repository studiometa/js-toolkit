import type Base from '../Base/index.js';
import type { BaseTypeParameter, BaseConstructor } from '../Base/index.js';
import type { DragServiceOptions } from '../services/drag.js';
import useDrag from '../services/drag.js';

type DragDecoratorOptions = DragServiceOptions & {
  target?: (this: Base, instance: Base) => HTMLElement;
};

/**
 * Add dragging capabilities to a component.
 */
export default function withDrag<T extends BaseTypeParameter = BaseTypeParameter>(
  BaseClass: BaseConstructor,
  { target = (instance) => instance.$el, ...options }: DragDecoratorOptions = {}
) {
  return class WithDrag<U extends BaseTypeParameter = BaseTypeParameter> extends BaseClass<T & U> {
    static config = {
      name: `${BaseClass.config.name}WithDrag`,
      emits: ['dragged'],
    };

    /**
     * Class constructor.
     * @param {HTMLElement} el
     */
    constructor(el) {
      super(el);

      this.$on('mounted', () => {
        this.$services.register(
          'dragged',
          useDrag.bind(undefined, target.call(this, this), options)
        );
        this.$services.enable('dragged');
      });

      this.$on('destroyed', () => {
        this.$services.disable('dragged');
        this.$services.unregister('dragged');
      });
    }
  }
}
