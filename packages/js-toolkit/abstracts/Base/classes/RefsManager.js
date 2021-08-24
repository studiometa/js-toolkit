import { warn } from '../utils.js';

/**
 * @typedef {import('../index.js').default} Base
 */

/**
 * Refs Manager
 */
export default class RefsManager {
  #element;

  #refs;

  #base;

  /**
   * Class constructor.
   *
   * @param {Base}        base    The base instance tied to this manager.
   * @param {HTMLElement} element The root element of a Base component.
   * @param {string[]}    refs    The list of refs of this component.
   */
  constructor(base, element, refs) {
    this.#element = element;
    this.#refs = refs;
    this.#base = base;
  }

  /**
   * Register all refs.
   */
  registerAll() {
    this.#refs.forEach((refName) => this.#register(refName));
    this.#base.$emit('get:refs', this);
  }

  /**
   * Register one ref.
   *
   * @param {string} refName The ref name.
   */
  #register(refName) {
    const isMultiple = refName.endsWith('[]');
    const propName = isMultiple ? refName.replace(/\[\]$/, '') : refName;

    const refs = Array.from(this.#element.querySelectorAll(`[data-ref="${refName}"]`))
      .filter(
        /**
         * @param {HTMLElement} ref
         */
        (ref) => this.#filterRefsBelongingToInstance(ref)
      )
      .map(
        /**
         * @param {HTMLElement & { __base__?: Base }} ref
         */
        (ref) => ref.__base__ ?? ref
      );

    if (!isMultiple && refs.length > 1) {
      warn(
        this.#base,
        `The "${refName}" ref has been found multiple times.`,
        'Did you forgot to add the `[]` suffix to its name?'
      );
    }

    Object.defineProperty(this, propName, {
      // @todo remove usage of non-multiple refs as array
      value: isMultiple || refs.length > 1 ? refs : refs[0],
      enumerable: true,
    });
  }

  /**
   * Filter refs belonging to the related Base instance.
   * @param {HTMLElement} ref The ref to test.
   */
  #filterRefsBelongingToInstance(ref) {
    let ancestor = ref.parentElement;

    while (ancestor && ancestor.dataset.component === undefined) {
      ancestor = ancestor.parentElement;
    }

    return ancestor === null || ancestor === this.#element;
  }
}
