import { isArray, isDefined, isDev, SmartQueue } from '../utils/index.js';
import type { Base, BaseConfig, BaseConstructor } from './index.js';
import { features } from './features.js';

let queue: SmartQueue;

/**
 * Add a task to the main queue.
 */
export function addToQueue(fn: () => unknown) {
  if (features.get('blocking')) {
    fn();
    return;
  }

  if (!queue) {
    queue = new SmartQueue();
  }

  return queue.add(fn);
}

const selectors = new Map();

// Separator used for multi-component declaration in `data-component` attributeS.
const separator = ' ';

/**
 * Get the selector for a given component.
 */
function getSelector(nameOrSelector: string): string {
  const { component } = features.get('attributes');
  const key = component + nameOrSelector;

  if (!selectors.has(key)) {
    const parts = [
      // Single selector
      `[${component}="${nameOrSelector}"]`,
      // Selector in the middle of a list of selectors
      `[${component}*="${separator}${nameOrSelector}${separator}"]`,
      // Selector at the end of a list of selectors
      `[${component}$="${separator}${nameOrSelector}"]`,
      // Selector at the beginning of a list of selectors
      `[${component}^="${nameOrSelector}${separator}"]`,
    ];
    selectors.set(key, parts.join(','));
  }

  return selectors.get(key);
}

/**
 * Get a list of elements based on the name of a component.
 *
 * @param {string} nameOrSelector
 *   The name or selector to used for this component.
 * @param {HTMLElement|Document} element
 *   The root element on which to query the selector, defaults to `document`.
 * @returns {Array<HTMLElement>}
 *   A list of elements on which the component should be mounted.
 */
export function getComponentElements(
  nameOrSelector: string,
  element: HTMLElement | Document = document,
): HTMLElement[] {
  const selector = getSelector(nameOrSelector);
  let elements = [];

  try {
    elements = Array.from(element.querySelectorAll(selector));
    // eslint-disable-next-line no-empty
  } catch {}

  // If no child component found with the default selector, and if the selector does not
  // start with an uppercase letter, matching a component's name, try a classic DOM selector.
  if (elements.length === 0 && nameOrSelector[0] === nameOrSelector[0].toLowerCase()) {
    elements = Array.from(element.querySelectorAll(nameOrSelector));
  }

  return elements;
}

/**
 * Test if an event is defined in the given config.
 */
export function eventIsDefinedInConfig(event: string, config: BaseConfig): boolean {
  return isArray(config.emits) && config.emits.includes(event);
}

/**
 * Test if an event can be used on the given element.
 */
export function eventIsNative(event: string, element: HTMLElement): boolean {
  return isDefined(element[`on${event}`]);
}

/**
 * Get the target of a given event.
 */
export function getEventTarget(
  instance: Base,
  event: string,
  config: BaseConfig,
): Base['$el'] {
  if (eventIsDefinedInConfig(event, config) || eventIsNative(event, instance.$el)) {
    return instance.$el;
  }
}

const instances = new Set<Base>();

/**
 * Get all mounted instances or the ones from a given component.
 */
export function getInstances(): Set<Base>;
export function getInstances<T extends BaseConstructor = BaseConstructor>(
  ctor: T,
): Set<InstanceType<T>>;
export function getInstances<T extends BaseConstructor = BaseConstructor>(
  ctor?: T,
): Set<InstanceType<T>> | Set<Base> {
  if (isDefined(ctor)) {
    const filteredInstances = new Set<InstanceType<T>>();
    for (const instance of instances) {
      if (instance instanceof ctor) {
        filteredInstances.add(instance as InstanceType<T>);
      }
    }
    return filteredInstances;
  } else {
    return new Set(instances);
  }
}

export function addInstance(instance: Base) {
  instances.add(instance);
}

export function deleteInstance(instance: Base) {
  instances.delete(instance);
}
