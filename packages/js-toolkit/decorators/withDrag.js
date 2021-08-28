import useDrag from '../services/drag.js';

/**
 * @typedef {import('../abstracts/Base').default} Base
 * @typedef {import('../abstracts/Base').BaseComponent} BaseComponent
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
 * @return {typeof DecoratedClass}
 */
export default function withDrag(
  BaseClass,
  options = {
    target() {
      return this.$el;
    },
  }
) {
  /* eslint-disable require-jsdoc */
  // @ts-ignore
  class DecoratedClass extends BaseClass {
    /**
     * Class constructor.
     * @param {HTMLElement} el
     * @this {Base}
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
  }

  return DecoratedClass;
}
