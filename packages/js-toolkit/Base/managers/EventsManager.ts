import type { Base } from '../index.js';
import getAllProperties from '../../utils/object/getAllProperties.js';
import { isArray } from '../../utils/index.js';
import { getEventTarget, eventIsNative, eventIsDefinedInConfig } from '../utils.js';
import AbstractManager from './AbstractManager.js';
import { normalizeRefName } from './RefsManager.js';

const names = new Map();

/**
 * Normalize the given name to PascalCase, such as:
 *
 * ```
 * sentence case          => SentenceCase
 * lowercase              => Lowercase
 * UPPERCASE              => Uppercase
 * kebab-case             => KebabCase
 * snake_case             => SnakeCase
 * camelCase              => CamelCase
 * PascalCase             => PascalCase
 * .class-selector        => ClassSelector
 * .bem__selector         => BemSelector
 * __id-selector          => IdSelector
 * .complex[class^ ="__"] => ComplexClass
 * ```
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name: string): string {
  if (!names.has(name)) {
    names.set(
      name,
      name
        .replace(/[A-Z]([A-Z].*)/g, (c) => c.toLowerCase())
        .replace(/[^a-zA-Z\d\s:]/g, ' ')
        .replace(/(^\w|\s+\w)/g, (c) => c.trim().toUpperCase())
        .trim(),
    );
  }

  return names.get(name);
}

const eventNames = new Map();

/**
 * Normalize the event names from PascalCase to kebab-case.
 *
 * @param {string} name
 * @returns {string}
 */
export function normalizeEventName(name: string): string {
  if (!eventNames.has(name)) {
    eventNames.set(name, name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, ''));
  }

  return eventNames.get(name);
}

const regexes = new Map();

/**
 * Get a regex with a cache;
 *
 * @param   {string} regex
 * @returns {RegExp}
 */
function getRegex(regex: string): RegExp {
  if (!regexes.has(regex)) {
    regexes.set(regex, new RegExp(regex));
  }

  return regexes.get(regex);
}

/**
 * Get the event name from the given method and its tied ref or children name.
 *
 * @param {string} method
 * @param {string} name
 * @returns {string}
 * @private
 */
function getEventNameByMethod(method: string, name = ''): string {
  const regex = getRegex(`^on${normalizeName(name)}([A-Z].*)$`);
  const [, event] = method.match(regex);
  return normalizeEventName(event);
}

/**
 * Get the base instance methods matching the `onSomething` pattern.
 *
 * @param {EventsManager} that
 * @param {string} [name]
 * @returns {string[]}
 * @private
 */
// eslint-disable-next-line no-use-before-define
function getEventMethodsByName(that: EventsManager, name = ''): string[] {
  const regex = getRegex(`^on${normalizeName(name)}[A-Z].*$`);
  const key = regex.toString();

  let methods = that.__methodsCache.get(key);

  if (!methods) {
    methods = Array.from(
      getAllProperties(that.__base, [], (method) => regex.test(method)).reduce(
        (set, [method]) => set.add(method),
        new Set(),
      ),
    ) as string[];
    that.__methodsCache.set(key, methods);
  }

  return methods;
}

/**
 * Manage a ref event methods.
 *
 * @param {EventsManager} that
 * @param  {string} name
 *   The name of the ref.
 * @param  {HTMLElement[]} elements
 *   The elements of the ref.
 * @param  {'add'|'remove'} [mode]
 *   The action to perform: add or remove the event listeners.
 * @returns {void}
 * @private
 */
function manageRef(
  // eslint-disable-next-line no-use-before-define
  that: EventsManager,
  name: string,
  elements: HTMLElement[],
  mode: 'add' | 'remove' = 'add',
) {
  const action = `${mode}EventListener`;
  const methods = getEventMethodsByName(that, name);
  methods.forEach((method) => {
    const event = getEventNameByMethod(method, name);
    elements.forEach((element) => element[action](event, that.__refsHandler));
  });
}
/**
 * Manage event methods to the given child instance.
 *
 * @param {EventsManager} that
 * @param {string} name
 *   The name of the ref.
 * @param {Base} instance
 *   A base instance.
 * @param {'add'|'remove'} [mode]
 *   The action to perform: add or remove the event listeners.
 * @returns {void}
 * @private
 */
function manageChild(
  // eslint-disable-next-line no-use-before-define
  that: EventsManager,
  name: string,
  instance: Base,
  mode: 'add' | 'remove' = 'add',
) {
  const action = mode === 'add' ? '$on' : '$off';
  const methods = getEventMethodsByName(that, name);
  methods.forEach((method) => {
    const event = getEventNameByMethod(method, name);
    instance[action](event, that.__childrenHandler);
  });
}
/**
 * Manage event methods on the root element.
 *
 * @param {EventsManager} that
 * @param {'add'|'remove'} [mode]
 *   The action to perform: add or remove the event listeners, defaults to 'add'.
 * @returns {void}
 * @private
 */
// eslint-disable-next-line no-use-before-define
function manageRootElement(that:EventsManager, mode:'add' | 'remove' = 'add') {
  const modeMethod = `${mode}EventListener`;
  const methods = getEventMethodsByName(that);

  const { __base: base, __config: config } = that;

  methods
    .map((method) => getEventNameByMethod(method))
    .filter((event) => eventIsDefinedInConfig(event, config) || eventIsNative(event, base.$el))
    .forEach((event) => {
      const target = getEventTarget(base, event, config);
      target[modeMethod](event, that.__rootElementHandler);
    });
}

/**
 * Event management class.
 * @todo Prevent binding of `onChildOrRefEvent` to the root element
 * @todo Use event delegation?
 */
export default class EventsManager extends AbstractManager {
  __methodsCache:Map<string, string[]> = new Map();

  /**
   * Event listener object for the root element.
   */
  __rootElementHandler:EventListenerObject = {
    handleEvent: (event:Event | CustomEvent) => {
      const normalizedEventName = normalizeName(event.type);
      const method = `on${normalizedEventName}`;

      if (event instanceof CustomEvent && isArray(event.detail) && event.detail.length) {
        this.__base[method](...event.detail, event);
      } else {
        this.__base[method](event);
      }
    },
  };

  /**
   * Event listener object for the refs.
   */
  __refsHandler:EventListenerObject = {
    handleEvent: (event) => {
      const ref = event.currentTarget as HTMLElement;
      const refName = normalizeRefName(ref.dataset.ref);

      const normalizedRefName = normalizeName(refName);
      const normalizedEventName = normalizeName(event.type);
      const method = `on${normalizedRefName}${normalizedEventName}`;

      let index = 0;
      if (isArray(this.__base.$refs[refName])) {
        index = (this.__base.$refs[refName] as HTMLElement[]).indexOf(ref);
      }

      this.__base[method](event, index);
    },
  };

  /**
   * Event listener object for the children.
   */
  __childrenHandler:EventListenerObject = {
    handleEvent: (event:CustomEvent) => {
      const childrenManager = this.__base.$children;

      // @todo handle async child components
      const { name, child: resolvedChild } = childrenManager.registeredNames
        .map((childName) => ({
          name: childName,
          child: [...childrenManager[childName]].find(
            // @ts-ignore
            (instance) => instance === event.currentTarget || instance.$el === event.currentTarget,
          ),
        }))
        .find(({ child }) => child);

      const normalizedChildName = normalizeName(name);
      const normalizedEventName = normalizeName(event.type);
      const method = `on${normalizedChildName}${normalizedEventName}`;

      const index = [...childrenManager[name]].indexOf(resolvedChild);

      const args = isArray(event.detail) ? event.detail : [];
      this.__base[method](...args, index, event);
    },
  };

  /**
   * Class constructor.
   */
  constructor(base:Base) {
    super(base);

    this.__hideProperties([
      '__methodsCache',
      '__rootElementHandler',
      '__refsHandler',
      '__childrenHandler',
    ]);
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   * @returns {void}
   */
  bindRef(name:string, elements:HTMLElement[]) {
    manageRef(this, name, elements);
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   * @returns {void}
   */
  unbindRef(name:string, elements:HTMLElement[]) {
    manageRef(this, name, elements, 'remove');
  }

  /**
   * Bind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   * @returns {void}
   */
  bindChild(name:string, instance:Base) {
    manageChild(this, name, instance);
  }

  /**
   * Unbind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   * @returns {void}
   */
  unbindChild(name:string, instance:Base) {
    manageChild(this, name, instance, 'remove');
  }

  /**
   * Bind event methods on the root element.
   *
   * @returns {void}
   */
  bindRootElement() {
    manageRootElement(this);
  }

  /**
   * Unbind event method from the root element.
   *
   * @returns {void}
   */
  unbindRootElement() {
    manageRootElement(this, 'remove');
  }
}