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
 * Refs Manager
 *
 * @todo Use `MutationObserver` to automatically update refs?
 */
export class RefsManager<T> extends AbstractManager<T> {
  /**
   * Get refs configuration.
   * @private
   */
  get __refs() {
    return this.__config.refs ?? [];
  }

  /**
   * Register all refs.
   */
  registerAll() {
    for (const refName of this.__refs) {
      this.__register(refName);
    }
  }

  /**
   * Unregister all refs.
   */
  unregisterAll() {
    for (const refName of this.__refs) {
      this.__unregister(refName);
    }
  }

  /**
   * Register one ref.
   * @private
   */
  __register(refName: string) {
    const isMultiple = endsWith(refName, '[]');
    const propName = normalizeRefName(refName);
    const { name } = this.__base.__config;
    const attributes = features.get('attributes');
    const refs = [] as HTMLElement[];
    const selector = `[${attributes.ref}="${refName}"],[${attributes.ref}="${name}.${refName}"]`;

    for (const ref of this.__element.querySelectorAll<HTMLElement>(selector)) {
      if (refBelongToInstance(ref, this.__element, name)) {
        refs.push(ref);
      }
    }

    /* v8 ignore next 7 */
    if (isDev && !isMultiple && refs.length > 1) {
      console.warn(
        `[${this.__base.$id}]`,
        `The "${refName}" ref has been found multiple times.`,
        'Did you forgot to add the `[]` suffix to its name?',
      );
    }

    if (refs.length) {
      this.__eventsManager.bindRef(refName, refs);
    }

    Object.defineProperty(this.props, camelCase(propName), {
      // @todo remove usage of non-multiple refs as array
      value: isMultiple || refs.length > 1 ? refs : refs[0],
      enumerable: true,
      configurable: true,
    });
  }

  /**
   * Unregister one ref.
   */
  __unregister(refName: string) {
    const propName = normalizeRefName(refName);
    const refs = this.props[propName];
    this.__eventsManager.unbindRef(refName, isArray(refs) ? refs : [refs]);
  }
}
