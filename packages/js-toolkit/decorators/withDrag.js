import useDrag from '../services/drag.js';

/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseComponent} BaseComponent
 * @typedef {import('../services/drag').DragServiceOptions} DragServiceOptions
 */

/**
 * @typedef {DragServiceOptions & { target: (this:Base) => HTMLElement }} DragDecoratorOptions
 */

/**
 * Add dragging capabilities to a component.
 *
 * @template {BaseComponent} T
 * @param {T} BaseClass
 * @param {DragDecoratorOptions} options
 * @return {T}
 */
export default function withDrag(
  BaseClass,
  options = {
    target() {
      return this.$el;
    },
  }
) {
  // @ts-ignore
  return class extends BaseClass {
    /**
     * Class constructor.
     * @param {HTMLElement} el
     */
    constructor(el) {
      super(el);

      this.$on('mounted', () => {
        const { target, ...otherOptions } = options;
        const boundUseDrag = useDrag.bind(undefined, target.call(this), otherOptions);
        this.$services.register('dragged', boundUseDrag);
        this.$services.enable('dragged');
      });

      this.$on('destroyed', () => {
        this.$services.disable('dragged');
        this.$services.unregister('dragged');
      });
    }
  };
}
