/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('./EventsManager.js').default} EventsManager
 */

/**
 * Refs Manager
 */
export default class RefsManager {
  /**
   * @type {HTMLElement}
   * @private
   */
  __element;

  /**
   * @type {string[]}
   * @private
   */
  __refs;

  /**
   * @type {Base}
   * @private
   */
  __base;

  /**
   * @type {EventsManager}
   * @private
   */
  __eventsManager;

  /**
   * Class constructor.
   *
   * @param {Base} base
   *   The base instance tied to this manager.
   * @param {HTMLElement} element
   *   The root element of a Base component.
   * @param {string[]} refs
   *   The list of refs of this component.
   * @param {EventsManager} eventsManager
   */
  constructor(base, element, refs, eventsManager) {
    this.__element = element;
    this.__refs = refs;
    this.__base = base;
    this.__eventsManager = eventsManager;
  }

  /**
   * Register all refs.
   *
   * @return {void}
   */
  registerAll() {
    this.__refs.forEach((refName) => this.__register(refName));
  }

  /**
   * Unregister all refs.
   *
   * @return {void}
   */
  unregisterAll() {
    this.__refs.forEach((refName) => this.__unregister(refName));
  }

  /**
   * Register one ref.
   *
   * @param {string} refName The ref name.
   * @private
   */
  __register(refName) {
    const isMultiple = refName.endsWith('[]');
    const propName = this.__normalizeRefName(refName);

    const refs = /** @type {HTMLElement[]} */ (
      Array.from(this.__element.querySelectorAll(`[data-ref="${refName}"]`))
    ).filter(
      /**
       * @param {HTMLElement} ref
       */
      (ref) => this.__filterRefsBelongingToInstance(ref)
    );

    if (!isMultiple && refs.length > 1) {
      console.warn(
        `[${this.__base.$options.name}]`,
        `The "${refName}" ref has been found multiple times.`,
        'Did you forgot to add the `[]` suffix to its name?'
      );
    }

    this.__eventsManager.bindRef(refName, refs);

    Object.defineProperty(this, propName, {
      // @todo remove usage of non-multiple refs as array
      value: isMultiple || refs.length > 1 ? refs : refs[0],
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * Unregister one ref.
   *
   * @param {string} refName The ref name.
   * @private
   */
  __unregister(refName) {
    const propName = this.__normalizeRefName(refName);
    const refs = Array.isArray(this[propName]) ? this[propName] : [this[propName]];
    this.__eventsManager.unbindRef(refName, refs);
  }

  /**
   * Normalize the name of ref.
   *
   * @param {string} name The original name.
   * @return {string}     The normalized name.
   * @private
   */
  __normalizeRefName(name) {
    return name.endsWith('[]') ? name.replace(/\[\]$/, '') : name;
  }

  /**
   * Filter refs belonging to the related Base instance.
   *
   * @param {HTMLElement} ref The ref to test.
   * @return {boolean}
   * @private
   */
  __filterRefsBelongingToInstance(ref) {
    let ancestor = ref.parentElement;

    while (ancestor && ancestor.dataset.component === undefined) {
      ancestor = ancestor.parentElement;
    }

    return ancestor === null || ancestor === this.__element;
  }
}
