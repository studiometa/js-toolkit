import { AbstractManager } from './AbstractManager.js';
import { isDev, isArray, isDefined } from '../../utils/index.js';

const NORMALIZE_REF_NAME_REGEX = /\[\]$/;
/**
 * Normalize the name of ref.
 */
export function normalizeRefName(name: string) {
  return name.endsWith('[]') ? name.replace(NORMALIZE_REF_NAME_REGEX, '') : name;
}

/**
 * Filter refs belonging to the related Base instance.
 */
function __filterRefsBelongingToInstance(that: RefsManager, ref: HTMLElement) {
  let ancestor = ref.parentElement;

  while (ancestor && !isDefined(ancestor.dataset.component)) {
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
function __register(that: RefsManager, refName: string) {
  const isMultiple = refName.endsWith('[]');
  const propName = normalizeRefName(refName);

  const refs = Array.from(
    that.__element.querySelectorAll<HTMLElement>(`[data-ref="${refName}"]`),
  ).filter((ref) => __filterRefsBelongingToInstance(that, ref));

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
function __unregister(that:RefsManager, refName:string) {
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
