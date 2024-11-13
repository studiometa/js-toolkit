import { AbstractManager } from './AbstractManager.js';
import {
  isDev,
  isArray,
  getAncestorWhereUntil,
  endsWith,
  startsWith,
  memo,
  camelCase,
} from '../../utils/index.js';
import { features } from '../features.js';

const NORMALIZE_REF_NAME_REGEX = /\[\]$/;
const NAMESPACED_REF_REGEX = /^(.*\.)/;

/**
 * Normalize the name of ref.
 */
export const normalizeRefName = memo(function normalizeRefName(name: string) {
  let normalizedName = name;

  if (endsWith(name, '[]')) {
    normalizedName = normalizedName.replace(NORMALIZE_REF_NAME_REGEX, '');
  }

  if (normalizedName.includes('.')) {
    return normalizedName.replace(NAMESPACED_REF_REGEX, '');
  }

  return normalizedName;
});

/**
 * Filter refs belonging to the related Base instance.
 */
function refBelongToInstance(ref: HTMLElement, rootElement: HTMLElement, name: string) {
  const attributes = features.get('attributes');
  const isPrefixed = startsWith(ref.getAttribute(attributes.ref), name);
  const firstComponentAncestor = getAncestorWhereUntil(
    ref,
    (el) =>
      el &&
      (isPrefixed
        ? el.getAttribute(attributes.component) === name && el
        : el.getAttribute(attributes.component)) &&
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
  const isMultiple = endsWith(refName, '[]');
  const propName = normalizeRefName(refName);
  const { name } = that.__base.$options;
  const attributes = features.get('attributes');
  const refs = [] as HTMLElement[];
  const selector = `[${attributes.ref}="${refName}"],[${attributes.ref}="${name}.${refName}"]`;

  for (const ref of that.__element.querySelectorAll<HTMLElement>(selector)) {
    if (refBelongToInstance(ref, that.__element, name)) {
      refs.push(ref);
    }
  }

  /* v8 ignore next 7 */
  if (isDev && !isMultiple && refs.length > 1) {
    console.warn(
      `[${that.__base.$id}]`,
      `The "${refName}" ref has been found multiple times.`,
      'Did you forgot to add the `[]` suffix to its name?',
    );
  }

  if (refs.length) {
    that.__eventsManager.bindRef(refName, refs);
  }

  Object.defineProperty(that, camelCase(propName), {
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
    for (const refName of this.__refs) __register(this, refName);
  }

  /**
   * Unregister all refs.
   */
  unregisterAll() {
    for (const refName of this.__refs) __unregister(this, refName);
  }
}
