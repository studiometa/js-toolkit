import type { Base, BaseProps } from '../index.js';
import { getAllProperties } from '../../utils/object/getAllProperties.js';
import { dashCase, isArray, pascalCase } from '../../utils/index.js';
import { getEventTarget, eventIsNative, eventIsDefinedInConfig } from '../utils.js';
import { AbstractManager } from './AbstractManager.js';
import { normalizeRefName } from './RefsManager.js';
import { features } from '../features.js';

const regexes = new Map();

/**
 * Get a regex with a cache;
 *
 * @param  {string} regex
 * @return {RegExp}
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
 * @return {string}
 * @private
 */
function getEventNameByMethod(method: string, name = ''): string {
  const regex = getRegex(`^on${pascalCase(name)}([A-Z].*)$`);
  const [, event] = method.match(regex);
  return dashCase(event);
}

/**
 * Get the base instance methods matching the `onSomething` pattern.
 *
 * @param {EventsManager} that
 * @param {string} [name]
 * @return {string[]}
 * @private
 */
// eslint-disable-next-line no-use-before-define
function getEventMethodsByName(that: EventsManager, name = ''): string[] {
  const regex = getRegex(`^on${pascalCase(name)}[A-Z].*$`);
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
 * @return {void}
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
  for (const method of methods) {
    const event = getEventNameByMethod(method, name);
    for (const element of elements) {
      element?.[action](event, that.__refsHandler);
    }
  }
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
 * @return {void}
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
  const config = instance.__config;
  for (const method of methods) {
    const event = getEventNameByMethod(method, name);
    if (getEventTarget(instance, event, config)) {
      instance[action](event, that.__childrenHandler);
    }
  }
}

const isDocumentRegex = /^onDocument[A-Z][a-z]+/;
const isWindowRegex = /^onWindow[A-Z][a-z]+/;
const methodIsDocument = (method) => isDocumentRegex.test(method);
const methodIsWindow = (method) => isWindowRegex.test(method);
const methodIsGlobal = (method) => methodIsWindow(method) || methodIsDocument(method);
const getGlobalEventTarget = (method) => (methodIsDocument(method) ? document : window);

/**
 * Manage event methods on the root element.
 *
 * @param {EventsManager} that
 * @param {'add'|'remove'} [mode]
 *   The action to perform: add or remove the event listeners, defaults to 'add'.
 * @return {void}
 * @private
 */
// eslint-disable-next-line no-use-before-define
function manageRootElement(that: EventsManager, mode: 'add' | 'remove' = 'add') {
  const modeMethod = `${mode}EventListener`;
  const methods = getEventMethodsByName(that);

  const { __base: base, __config: config } = that;

  for (const method of methods) {
    let event = getEventNameByMethod(method);

    if (methodIsGlobal(method)) {
      event = getEventNameByMethod(method, methodIsDocument(method) ? 'document' : 'window');
      const target = getGlobalEventTarget(method);
      target[modeMethod](
        event,
        methodIsDocument(method) ? that.__documentHandler : that.__windowHandler,
      );
    } else {
      const target = getEventTarget(base, event, config);
      target?.[modeMethod](event, that.__rootElementHandler);
    }
  }
}

export type EventManagerCallbackParams<T extends Event = Event> = {
  event: T;
  args: Array<any>;
  index: number;
  target: Element | Base | Promise<Base> | typeof window | typeof document | null;
};

/**
 * Normalize `on...` method params.
 */
function normalizeParams(
  params: Partial<EventManagerCallbackParams> = {},
): EventManagerCallbackParams {
  return {
    event: null,
    args: [],
    index: 0,
    target: null,
    ...params,
  };
}

/**
 * Event management class.
 *
 * @todo Prevent binding of `onChildOrRefEvent` to the root element
 * @todo Use event delegation?
 */
export class EventsManager extends AbstractManager {
  __methodsCache: Map<string, string[]> = new Map();

  /**
   * Event listener object for the root element.
   */
  __rootElementHandler: EventListenerObject = {
    handleEvent: (event: Event | CustomEvent) => {
      const normalizedEventName = pascalCase(event.type);
      const method = `on${normalizedEventName}`;
      const isCustomEvent = event instanceof CustomEvent;

      this.__base[method](
        normalizeParams({
          event,
          args: isCustomEvent ? (event.detail ?? []) : [],
          target: isCustomEvent ? this.__base : this.__element,
        }),
      );
    },
  };

  /**
   * Event listener object for the root element.
   *
   * @type {EventListenerObject}
   */
  __documentHandler = {
    /**
     * @param  {Event|CustomEvent} event
     * @return {void}
     */
    handleEvent: (event) => {
      const normalizedEventName = pascalCase(event.type);
      const method = `onDocument${normalizedEventName}`;

      this.__base[method](normalizeParams({ event, target: document }));
    },
  };

  /**
   * Event listener object for the root element.
   *
   * @type {EventListenerObject}
   */
  __windowHandler = {
    /**
     * @param  {Event|CustomEvent} event
     * @return {void}
     */
    handleEvent: (event) => {
      const normalizedEventName = pascalCase(event.type);
      const method = `onWindow${normalizedEventName}`;

      this.__base[method](normalizeParams({ event, target: window }));
    },
  };

  /**
   * Event listener object for the refs.
   */
  __refsHandler: EventListenerObject = {
    handleEvent: (event) => {
      const ref = event.currentTarget as HTMLElement;
      const attributes = features.get('attributes');
      const refName = normalizeRefName(ref.getAttribute(attributes.ref));

      const normalizedRefName = pascalCase(refName);
      const normalizedEventName = pascalCase(event.type);
      const method = `on${normalizedRefName}${normalizedEventName}`;

      let index = 0;
      if (isArray(this.__base.$refs[refName])) {
        index = (this.__base.$refs[refName] as HTMLElement[]).indexOf(ref);
      }

      this.__base[method](normalizeParams({ event, index, target: ref }));
    },
  };

  /**
   * Event listener object for the children.
   */
  __childrenHandler: EventListenerObject = {
    handleEvent: (event: CustomEvent) => {
      const children = this.__base.$children;

      for (const childName of Object.keys(children)) {
        let index = -1;

        for (const child of children[childName] as Base<BaseProps>[]) {
          index++;

          if (
            child.$el === event.currentTarget &&
            (eventIsNative(event.type, child.$el) ||
              eventIsDefinedInConfig(event.type, child.__config))
          ) {
            const normalizedEventName = pascalCase(event.type);
            const normalizedChildName = pascalCase(childName);
            const method = `on${normalizedChildName}${normalizedEventName}`;
            const args = isArray(event.detail) ? event.detail : [];
            this.__base[method](normalizeParams({ event, index, args, target: child }));
          }
        }
      }
    },
  };

  /**
   * Class constructor.
   */
  constructor(base: Base) {
    super(base);
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   * @return {void}
   */
  bindRef(name: string, elements: HTMLElement[]) {
    manageRef(this, name, elements);
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   * @return {void}
   */
  unbindRef(name: string, elements: HTMLElement[]) {
    manageRef(this, name, elements, 'remove');
  }

  /**
   * Bind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   * @return {void}
   */
  bindChild(name: string, instance: Base) {
    manageChild(this, name, instance);
  }

  /**
   * Unbind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   * @return {void}
   */
  unbindChild(name: string, instance: Base) {
    manageChild(this, name, instance, 'remove');
  }

  /**
   * Bind event methods on the root element.
   *
   * @return {void}
   */
  bindRootElement() {
    manageRootElement(this);
  }

  /**
   * Unbind event method from the root element.
   *
   * @return {void}
   */
  unbindRootElement() {
    manageRootElement(this, 'remove');
  }
}
