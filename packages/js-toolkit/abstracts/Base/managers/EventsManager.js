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
   * @param {Base} base
   */
  constructor(rootElement, base) {
    this.#rootElement = rootElement;
    this.#base = base;
  }

  /**
   * Manage a ref event methods.
   *
   * @param  {string} name
   *   The name of the ref.
   * @param  {HTMLElement[]} elements
   *   The elements of the ref.
   * @param  {'add'|'remove'} [mode]
   *   The action to perform: add or remove the event listeners.
   *
   * @return {void}
   */
  #manageRef(name, elements, mode = 'add') {
    const action = `${mode}EventListener`;
    const methods = this.#getEventMethodsByName(name);
    methods.forEach((method) => {
      const event = this.#getEventNameByMethod(method, name);
      elements.forEach((element) => element[action](event, this.#base[method]));
    });
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   *
   * @return {void}
   */
  bindRef(name, elements) {
    this.#manageRef(name, elements);
  }

  /**
   * Bind event methods to the given ref elements.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {HTMLElement[]} elements
   *   The elements of the ref.
   *
   * @return {void}
   */
  unbindRef(name, elements) {
    this.#manageRef(name, elements, 'remove');
  }

  /**
   * Manage event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   * @param {'add'|'remove'} [mode]
   *   The action to perform: add or remove the event listeners.
   *
   * @return {void}
   */
  #manageChild(name, instance, mode = 'add') {
    const action = mode === 'add' ? '$on' : '$off';
    const methods = this.#getEventMethodsByName(name);
    methods.forEach((method) => {
      const event = this.#getEventNameByMethod(method, name);
      instance[action](event, this.#base[method]);
    });
  }

  /**
   * Bind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   *
   * @return {void}
   */
  bindChild(name, instance) {
    this.#manageChild(name, instance);
  }

  /**
   * Unbind event methods to the given child instance.
   *
   * @param {string} name
   *   The name of the ref.
   * @param {Base} instance
   *   A base instance.
   *
   * @return {void}
   */
  unbindChild(name, instance) {
    this.#manageChild(name, instance, 'remove');
  }

  /**
   * Manage event methods on the root element.
   *
   * @param {'add'|'remove'} [mode]
   *   The action to perform: add or remove the event listeners.
   *
   * @return {void}
   */
  #manageRootElement(mode = 'add') {
    const modeMethod = `${mode}EventListener`;
    const methods = this.#getEventMethodsByName();
    methods.forEach((method) => {
      const event = this.#getEventNameByMethod(method);
      this.#rootElement[modeMethod](event, this.#base[method]);
    });
  }

  /**
   * Bind event methods on the root element.
   *
   * @return {void}
   */
  bindRootElement() {
    this.#manageRootElement();
  }

  /**
   * Unbind event method from the root element.
   *
   * @return {void}
   */
  unbindRootElement() {
    this.#manageRootElement('remove');
  }

  /**
   * Get the event name from the given method and its tied ref or children name.
   *
   * @param {string} method
   * @param {string} name
   * @return {string}
   */
  #getEventNameByMethod(method, name = '') {
    const normalizedName = EventsManager.normalizeName(name);
    const regex = new RegExp(`^on${normalizedName}([A-Z].*)$`);
    const [, event] = method.match(regex);
    return EventsManager.normalizeEventName(event);
  }

  /**
   * Get the base instance methods matching the `onSomething` pattern.
   *
   * @param {string} [name]
   * @return {string[]}
   */
  #getEventMethodsByName(name = '') {
    const normalizedName = EventsManager.normalizeName(name);
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
   * .bem__selector        => BemSelector
   * #id-selector          => IdSelector
   * .complex[class^ ="#"] => ComplexClass
   * ```
   *
   * @param {string} name
   * @return {string}
   */
  static normalizeName(name) {
    return name
      .replace(/[A-Z]([A-Z].*)/g, (c) => c.toLowerCase())
      .replace(/[^a-zA-Z\d\s:]/g, ' ')
      .replace(/(^\w|\s+\w)/g, (c) => c.trim().toUpperCase())
      .trim();
  }

  /**
   * Normalize the event names from PascalCase to kebab-case.
   *
   * @param {string} name
   * @return {string}
   */
  static normalizeEventName(name) {
    return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^-/, '');
  }
}
