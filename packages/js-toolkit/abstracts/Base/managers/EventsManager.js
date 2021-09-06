import getAllProperties from '../../../utils/object/getAllProperties.js';

/**
 * @typedef {import('../index.js').default} Base
 * @typedef {import('./RefsManager.js').default} RefsManager
 * @typedef {import('./ChildrenManager.js').default} ChildrenManager
 */

/**
 * Event management class.
 */
export default class EventsManager {
  /**
   * @type {HTMLElement}
   */
  #rootElement;

  /**
   * @type {RefsManager}
   */
  #refs;

  /**
   * @type {ChildrenManager}
   */
  #children;

  /**
   * @type {Base}
   */
  #base;

  /**
   * @type {WeakMap}
   */
  #methodsCache = new WeakMap();

  /**
   * Class constructor.
   *
   * @param {HTMLElement} rootElement
   * @param {RefsManager} refs
   * @param {ChildrenManager} children
   * @param {Base} base
   */
  constructor(rootElement, refs, children, base) {
    this.#rootElement = rootElement;
    this.#refs = refs;
    this.#children = children;
    this.#base = base;
  }

  /**
   * Bind all event methods.
   *
   * @return {void}
   */
  bindAll() {
    this.manageRootElement('add');
    this.manageRefs('add');
    this.manageChildren('add');
  }

  /**
   * Unbind all event methods.
   *
   * @return {void}
   */
  unbindAll() {
    this.manageRootElement('remove');
    this.manageRefs('remove');
    this.manageChildren('remove');
  }

  /**
   * Unbind event methods from the root element.
   *
   * @param {'add'|'remove'} [mode]
   * @return {void}
   */
  manageRootElement(mode = 'add') {
    const modeMethod = `${mode}EventListener`;
    const methods = this.getEventMethodsByName();
    methods.forEach((method) => {
      const event = this.getEventNameByMethod(method);
      this.#rootElement[modeMethod](event, method);
    });
  }

  /**
   * Bind event methods to the base instance refs.
   *
   * @param {'add'|'remove'} [mode]
   * @return {void}
   */
  manageRefs(mode = 'add') {
    const modeMethod = `${mode}EventListener`;
    Object.entries(this.#refs).forEach(([name, ref]) => {
      const methods = this.getEventMethodsByName(name);
      methods.forEach((method) => {
        const event = this.getEventNameByMethod(method, name);

        if (Array.isArray(ref)) {
          // @todo
          ref.forEach((element) => element[modeMethod](event, method));
        } else {
          // @todo
          ref[modeMethod](event, method);
        }
      });
    });
  }

  /**
   * Unbind event methods to the base instance children.
   *
   * @param {'add'|'remove'} [mode]
   * @return {void}
   */
  manageChildren(mode = 'add') {
    const modeMethod = mode === 'add' ? '$on' : '$off';
    Object.entries(this.#children).forEach(([name, children]) => {
      const methods = this.getEventMethodsByName(name);

      methods.forEach((method) => {
        const event = this.getEventNameByMethod(method, name);

        children.forEach(async (child) => {
          if (child instanceof Promise) {
            // eslint-disable-next-line no-param-reassign
            child = await child;
          }

          // @todo
          child[modeMethod](event, method);
        });
      });
    });
  }

  /**
   * Get the event name from the given method and its tied ref or children name.
   *
   * @param {string} method
   * @param {string} name
   * @return {string}
   */
  getEventNameByMethod(method, name = '') {
    const normalizedName = this.normalizeName(name);
    const regex = new RegExp(`^on${normalizedName}([A-Z].*)$`);
    const [, event] = method.match(regex);
    return this.normalizeEventName(event);
  }

  /**
   * Get the base instance methods matching the `onSomething` pattern.
   *
   * @param {string} [name]
   * @return {string[]}
   */
  getEventMethodsByName(name = '') {
    const normalizedName = this.normalizeName(name);
    const regex = new RegExp(`^on${normalizedName}[A-Z].*$`);

    let methods = this.#methodsCache.get(regex);
    if (!methods) {
      methods = getAllProperties(this.#base, [], (method) => regex.test(method));
      this.#methodsCache.set(regex, methods);
    }

    return methods.reduce((acc, [method]) => {
      if (!acc.includes(method)) {
        acc.push(method);
      }
      return acc;
    }, []);
  }

  /**
   * Normalize the given name to PascalCase, such as:
   *
   * ```
   * sentence case         => SentenceCase
   * lowercase             => Lowercase
   * UPPERCASE             => Uppercase
   * kebab-case            => KebabCase
   * snake_case            => SnakeCase
   * camelCase             => CamelCase
   * PascalCase            => PascalCase
   * .class-selector       => ClassSelector
   * #id-selector          => IdSelector
   * .complex[class^ ="#"] => ComplexClass
   * ```
   *
   * @param {string} name
   * @return {string}
   */
  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-zA-Z\d\s:]/g, ' ')
      .replace(/(^\w|\s\w)/g, (c) => c.trim().toUpperCase())
      .trim();
  }

  /**
   * Normalize the event names from PascalCase to kebab-case.
   *
   * @param {string} name
   * @return {string}
   */
  normalizeEventName(name) {
    return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, '');
  }
}
