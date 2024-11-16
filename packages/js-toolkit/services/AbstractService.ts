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

export class AbstractService<PropsType> {
  isInit = false;
  props = {};

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
    if (this.callbacks.size === 0 && !this.isInit) {
      this.init();
      this.isInit = true;
    }

    this.callbacks.set(key, callback);
  }

  /**
   * Remove a callback from the service by its key.
   */
  remove(key: string) {
    this.callbacks.delete(key);

    // Kill the service when we remove the last callback
    if (this.callbacks.size === 0 && this.isInit) {
      this.kill();
      this.isInit = false;
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

  init() {
    throw new Error('The init method must be implemented.');
  }

  kill() {
    throw new Error('The kill method must be implemented');
  }

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
}
