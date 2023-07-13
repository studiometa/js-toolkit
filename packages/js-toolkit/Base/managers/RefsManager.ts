import { AbstractManager } from './AbstractManager.js';
import { isDev, isArray, isDefined, getAncestorWhereUntil } from '../../utils/index.js';

const NORMALIZE_REF_NAME_REGEX = /\[\]$/;
const NAMESPACED_REF_REGEX = /^(.*\.)/;
const normalizedRefNamesCache = new Map();

/**
 * Normalize the name of ref.
 */
export function normalizeRefName(name: string) {
  if (normalizedRefNamesCache.has(name)) {
    return normalizedRefNamesCache.get(name);
  }

  let normalizedName = name;

  if (name.endsWith('[]')) {
    normalizedName = normalizedName.replace(NORMALIZE_REF_NAME_REGEX, '');
  }

  if (normalizedName.includes('.')) {
    return normalizedName.replace(NAMESPACED_REF_REGEX, '');
  }

  normalizedRefNamesCache.set(name, normalizedName);
  return normalizedName;
}

/**
 * Filter refs belonging to the related Base instance.
 */
function refBelongToInstance(ref: HTMLElement, rootElement: HTMLElement, name: string) {
  const isPrefixed = ref.dataset.ref.startsWith(name);
  const firstComponentAncestor = getAncestorWhereUntil(
    ref,
    (el) =>
      el &&
      (isPrefixed ? el.dataset.component === name && el : isDefined(el.dataset.component)) &&
      el !== rootElement,
    (el) => el === rootElement,
  );

  return firstComponentAncestor === rootElement;
}

/**
 * Register one ref.
 *
 * @param {RefsManager} that
 * @param {string} refName The ref name.
 * @private
 */
function __register(that: RefsManager, refName: string) {
  const isMultiple = refName.endsWith('[]');
  const propName = normalizeRefName(refName);
  const { name } = that.__base.$options;

  const refs = Array.from(
    that.__element.querySelectorAll<HTMLElement>(
      `[data-ref="${refName}"],[data-ref="${name}.${refName}"]`,
    ),
  ).filter((ref) => refBelongToInstance(ref, that.__element, name));

  if (isDev && !isMultiple && refs.length > 1) {
    console.warn(
      // @ts-ignore
      `[${that.__base.$options.name}]`,
      `The "${refName}" ref has been found multiple times.`,
      'Did you forgot to add the `[]` suffix to its name?',
    );
  }

  if (!isMultiple && refs.length <= 1 && !isDefined(refs[0])) {
    if (isDev) {
      console.warn(
        // @ts-ignore
        `[${that.__base.$options.name}]`,
        `The "${refName}" ref is missing.`,
        `Is there an \`[data-ref="${refName}"]\` element in the component's scope?`,
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
 */
function __unregister(that: RefsManager, refName: string) {
  const propName = normalizeRefName(refName);
  const refs = isArray(that[propName]) ? that[propName] : [that[propName]];
  that.__eventsManager.unbindRef(refName, refs);
}

/**
 * Refs Manager
 *
 * @todo Use `MutationObserver` to automatically update refs?
 */
export class RefsManager extends AbstractManager {
  /**
   * Get refs configuration.
   */
  get __refs() {
    return this.__config.refs ?? [];
  }

  /**
   * Register all refs.
   */
  registerAll() {
    this.__refs.forEach((refName) => __register(this, refName));
  }

  /**
   * Unregister all refs.
   */
  unregisterAll() {
    this.__refs.forEach((refName) => __unregister(this, refName));
  }
}
