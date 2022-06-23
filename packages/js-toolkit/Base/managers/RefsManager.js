import AbstractManager from './AbstractManager.js';
import { isDev } from '../../utils/index.js';

/**
 * Normalize the name of ref.
 *
 * @param {string} name The original name.
 * @returns {string}     The normalized name.
 */
export function normalizeRefName(name) {
  return name.endsWith('[]') ? name.replace(/\[\]$/, '') : name;
}

/**
 * Filter refs belonging to the related Base instance.
 *
 * @param {RefsManager} that
 * @param {HTMLElement} ref The ref to test.
 * @returns {boolean}
 * @private
 */
function __filterRefsBelongingToInstance(that, ref) {
  let ancestor = ref.parentElement;

  while (ancestor && ancestor.dataset.component === undefined) {
    ancestor = ancestor.parentElement;
  }

  return ancestor === null || ancestor === that.__element;
}

/**
 * Register one ref.
 *
 * @param {RefsManager} that
 * @param {string} refName The ref name.
 * @private
 */
function __register(that, refName) {
  const isMultiple = refName.endsWith('[]');
  const propName = normalizeRefName(refName);

  const refs = /** @type {HTMLElement[]} */ (
    Array.from(that.__element.querySelectorAll(`[data-ref="${refName}"]`))
  ).filter(
    /**
     * @param {HTMLElement} ref
     * @returns {boolean}
     */
    (ref) => __filterRefsBelongingToInstance(that, ref)
  );

  if (!isMultiple && refs.length > 1) {
    if (isDev) {
      console.warn(
        // @ts-ignore
        `[${that.__base.$options.name}]`,
        `The "${refName}" ref has been found multiple times.`,
        'Did you forgot to add the `[]` suffix to its name?'
      );
    }
  }

  if (!isMultiple && refs.length <= 1 && refs[0] === undefined) {
    if (isDev) {
      console.warn(
        // @ts-ignore
        `[${that.__base.$options.name}]`,
        `The "${refName}" ref is missing.`,
        `Is there an \`[data-ref="${refName}"]\` element in the component's scope?`
      );
    }

    return;
  }

  that.__eventsManager.bindRef(refName, refs);

  Object.defineProperty(that, propName, {
    // @todo remove usage of non-multiple refs as array
    value: isMultiple || refs.length > 1 ? refs : refs[0],
    enumerable: true,
    configurable: true,
  });
}

/**
 * Unregister one ref.
 *
 * @param {RefsManager} that
 * @param {string} refName The ref name.
 * @private
 */
function __unregister(that, refName) {
  const propName = normalizeRefName(refName);
  const refs = Array.isArray(that[propName]) ? that[propName] : [that[propName]];
  that.__eventsManager.unbindRef(refName, refs);
}

/**
 * Refs Manager
 *
 * @todo Use `MutationObserver` to automatically update refs?
 */
export default class RefsManager extends AbstractManager {
  /**
   * Get refs configuration.
   * @returns {string[]}
   */
  get __refs() {
    return this.__config.refs ?? [];
  }

  /**
   * Register all refs.
   *
   * @returns {void}
   */
  registerAll() {
    this.__refs.forEach((refName) => __register(this, refName));
  }

  /**
   * Unregister all refs.
   *
   * @returns {void}
   */
  unregisterAll() {
    this.__refs.forEach((refName) => __unregister(this, refName));
  }
}
