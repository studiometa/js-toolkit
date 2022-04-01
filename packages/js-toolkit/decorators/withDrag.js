import useDrag from '../services/drag.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 * @typedef {import('../services/drag').DragServiceOptions} DragServiceOptions
 */

/**
 * @typedef {DragServiceOptions & { target?: (this:Base, Base) => HTMLElement }} DragDecoratorOptions
 */

/**
 * Add dragging capabilities to a component.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @param {DragDecoratorOptions} options
 * @returns {T}
 */
export default function withDrag(
  BaseClass,
  { target = (instance) => instance.$el, ...options } = {}
) {
  // @ts-ignore
  return class extends BaseClass {
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
  };
}
