import useDrag from '../services/drag.js';

/**
 * @typedef {import('deepmerge').Options} DeepmergeOptions
 * @typedef {import('../abstracts/Base/index').BaseComponent} BaseComponent
 * @typedef {import('../services/drag').DragServiceOptions} DragServiceOptions
 */

/**
 * @typedef {DragServiceOptions & { target: (this:BaseComponent) => HTMLElement }} DragDecoratorOptions
 */

/**
 * Add dragging capabilities to a component.
 *
 * @param {BaseComponent} Base
 * @param {DragDecoratorOptions} options
 * @return {BaseComponent}
 */
export default function withDrag(
  Base,
  options = {
    target() {
      return this.$el;
    },
  }
) {
  return class extends Base {
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
  };
}
