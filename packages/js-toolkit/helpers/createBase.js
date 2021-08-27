import defineComponent from './defineComponent.js';

/**
 * Create a Base instance with the given object configuration.
 *
 * @param {HTMLElement|String} elementOrSelector The instance root HTML element.
 * @param {Object}             options           The Base class configuration.
 */
export default function createBase(elementOrSelector, options) {
  const Component = defineComponent(options);
  /** @type {HTMLElement} */
  const element =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  return new Component(element);
}
