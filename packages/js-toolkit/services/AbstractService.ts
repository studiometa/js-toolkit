export interface ServiceInterface<T> {
  /**
   * Remove a function from the resize service by its key.
   */
  remove(key: string): void;
  /**
   * Add a callback to the service. The callback will receive the current service props as parameter.
   */
  add(key: string, callback: (props: T) => void): void;
  /**
   * Test if the service has alreaydy a callback for the given key.
   */
  has(key: string): boolean;
  /**
   * Get the service's props.
   */
  props(): T;
}

/**
 * Service configuration of events to be attached to targets.
 */
export type ServiceConfig = [
  (instance: AbstractService) => EventTarget,
  [string, AddEventListenerOptions?][],
][];

/**
 * AbstractService class.
 */
export class AbstractService<PropsType = any> {
  /**
   * Used to type `this.constructor` correctly
   * @see https://github.com/microsoft/TypeScript/issues/3841#issuecomment-2381594311
   */
  declare ['constructor']: typeof AbstractService;

  /**
   * Service configuration.
   */
  static config: ServiceConfig = [];

  /**
   * Cache for the created instances.
   */
  static __instances = new Map();

  /**
   * Get a service instance as a singleton based on the given key.
   */
  static getInstance<T extends ServiceInterface<any>>(key: any = this, ...args: any[]) {
    if (!this.__instances.has(key)) {
      // @ts-ignore
      const instance = new this(...args);
      this.__instances.set(key, {
        add: (key, callback) => instance.add(key, callback),
        remove: (key) => instance.remove(key),
        has: (key) => instance.has(key),
        props: () => instance.props,
      } as T);
    }

    return this.__instances.get(key);
  }

  /**
   * Is the service active or not?
   */
  __isInit = false;

  /**
   * Props for the service.
   */
  props = {};

  /**
   * Holds all the callbacks that will be triggered.
   */
  callbacks: Map<string, (props: PropsType) => unknown> = new Map();

  /**
   * Does the service has the given key?
   */
  has(key: string): boolean {
    return this.callbacks.has(key);
  }

  /**
   * Get a service callback by its key.
   */
  get(key: string): (props: PropsType) => unknown {
    return this.callbacks.get(key);
  }

  /**
   * Add a callback to the service.
   */
  add(key: string, callback: (props: PropsType) => unknown) {
    if (this.has(key)) {
      console.warn(`The key \`${key}\` has already been added.`);
      return;
    }

    // Initialize the service when we add the first callback
    if (this.callbacks.size === 0 && !this.__isInit) {
      this.init();
      this.__isInit = true;
    }

    this.callbacks.set(key, callback);
  }

  /**
   * Remove a callback from the service by its key.
   */
  remove(key: string) {
    this.callbacks.delete(key);

    // Kill the service when we remove the last callback
    if (this.callbacks.size === 0 && this.__isInit) {
      this.kill();
      this.__isInit = false;
    }
  }

  /**
   * Trigger all service callbacks with service props.
   */
  trigger(props: PropsType) {
    for (const callback of this.callbacks.values()) {
      callback(props);
    }
  }

  /* v8 ignore next 6 */
  /**
   * Implements the EventListenerObject interface.
   */
  handleEvent(event: Event) {
    // Should be implemented.
  }

  /**
   * Add or remove event listeners based on the static `config` property.
   */
  __manageEvents(mode: 'add' | 'remove') {
    for (const [target, events] of this.constructor.config) {
      const resolvedTarget = target(this);
      for (const [type, options] of events) {
        resolvedTarget[`${mode}EventListener`](type, this, options);
      }
    }
  }

  /**
   * Triggered when the service is initialized.
   */
  init() {
    this.__manageEvents('add');
  }

  /**
   * Triggered when the service is killed.
   */
  kill() {
    this.__manageEvents('remove');
  }
}
