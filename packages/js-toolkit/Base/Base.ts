/* eslint-disable no-use-before-define */
import {
  getComponentElements,
  getEventTarget,
  addToQueue,
  addInstance,
  deleteInstance,
} from './utils.js';
import {
  ChildrenManager,
  RefsManager,
  ServicesManager,
  EventsManager,
  OptionsManager,
} from './managers/index.js';
import { getInstanceFromElement } from '../helpers/getInstanceFromElement.js';
import { noop, isDev, isFunction, isArray } from '../utils/index.js';

let id = 0;

export type BaseEl = HTMLElement & { __base__?: Map<string, Base | 'terminated'> };
export type BaseConstructor<T extends Base = Base> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  prototype: Base;
} & Pick<typeof Base, keyof typeof Base>;
export type BaseAsyncConstructor<T extends Base = Base> = (
  instance: Base,
) => Promise<BaseConstructor<T> | { default: BaseConstructor<T> }>;
export type BaseOptions = { [name: string]: unknown };
export type BaseRefs = { [name: string]: HTMLElement | HTMLElement[] };
export type BaseChildren = { [nameOrSelector: string]: Base[] | Promise<Base>[] };
export type BaseConfigComponents = {
  [nameOrSelector: string]: BaseConstructor | BaseAsyncConstructor;
};

export type BaseConfig = {
  name: string;
  debug?: boolean;
  log?: boolean;
  refs?: string[];
  emits?: string[];
  components?: BaseConfigComponents;
  options?: import('./managers/OptionsManager').OptionsSchema;
};

export type BaseProps = {
  $el?: HTMLElement;
  $options?: BaseOptions;
  $refs?: BaseRefs;
  $children?: BaseChildren;
  $parent?: Base;
};

export type Managers = {
  ChildrenManager: typeof ChildrenManager;
  EventsManager: typeof EventsManager;
  OptionsManager: typeof OptionsManager;
  RefsManager: typeof RefsManager;
  ServicesManager: typeof ServicesManager;
};

/**
 * Base class.
 */
export class Base<T extends BaseProps = BaseProps> {
  /**
   * Declare the `this.constructor` type
   * @link https://github.com/microsoft/TypeScript/issues/3841#issuecomment-2381594311
   */
  declare ['constructor']: BaseConstructor;

  /**
   * This is a Base instance.
   */
  static readonly $isBase = true as const;

  /**
   * The instance parent.
   */
  $parent: T['$parent'] & Base = null;

  /**
   * The instance id.
   */
  $id: string;

  /**
   * The root element.
   */
  $el: T['$el'] & BaseEl;

  /**
   * The state of the component.
   */
  $isMounted = false;

  /**
   * Is the component currently mounting itself and its children?
   * @private
   */
  __isMounting = false;

  /**
   * Store the event handlers.
   * @private
   */
  __eventHandlers: Map<string, Set<EventListenerOrEventListenerObject>> = new Map();

  /**
   * Get the root instance of the app.
   */
  get $root(): Base {
    if (!this.$parent) {
      return this;
    }

    let parent = this.$parent;
    let root = this.$parent;

    while (parent) {
      if (!parent.$parent) {
        root = parent;
      }

      parent = parent.$parent;
    }

    return root;
  }

  /**
   * Merge configuration with the parents' configurations.
   * @private
   */
  get __config(): BaseConfig {
    let proto = Object.getPrototypeOf(this);
    let { config } = proto.constructor;

    while (proto.constructor.config && proto.constructor.$isBase) {
      config = { ...proto.constructor.config, ...config };

      if (proto.constructor.config.options) {
        config.options = { ...proto.constructor.config.options, ...config.options };
      }

      if (proto.constructor.config.emits && config.emits) {
        config.emits = [...proto.constructor.config.emits, ...config.emits];
      }

      proto = Object.getPrototypeOf(proto);
    }

    config.options = config.options ?? {};
    config.refs = config.refs ?? [];
    config.components = config.components ?? {};

    return config;
  }

  get $config() {
    return this.__config;
  }

  static config: BaseConfig = {
    name: 'Base',
    emits: [
      // hook events
      'before-mounted',
      'mounted',
      'updated',
      'destroyed',
      'terminated',
      // default services' events
      'ticked',
      'scrolled',
      'resized',
      'moved',
      'loaded',
      'keyed',
    ],
  };

  __services: ServicesManager;

  get $services(): ServicesManager {
    return this.__services;
  }

  __refs: RefsManager<T['$refs'] & BaseRefs>;

  get $refs(): T['$refs'] & BaseRefs {
    return this.__refs.props;
  }

  __options: OptionsManager<T['$options'] & BaseOptions>;

  get $options(): T['$options'] & BaseOptions {
    return this.__options.props;
  }

  __children: ChildrenManager<T['$children'] & BaseChildren>;

  get $children(): T['$children'] & BaseChildren {
    return this.__children.props;
  }

  __events: EventsManager;

  /**
   * Small helper to log stuff.
   */
  get $log(): (...args: unknown[]) => void {
    return this.$options.log ? window.console.log.bind(window, `[${this.$id}]`) : noop;
  }

  /**
   * Small helper to make warning easier.
   */
  get $warn(): (...args: unknown[]) => void {
    return this.$options.log ? window.console.warn.bind(window, `[${this.$id}]`) : noop;
  }

  /**
   * Small helper to debug information.
   */
  get __debug(): (...args: unknown[]) => void {
    return isDev && this.$options.debug
      ? window.console.log.bind(window, `[debug] [${this.$id}]`)
      : noop;
  }

  /**
   * Get manager constructors.
   */
  get __managers(): Managers {
    return {
      ChildrenManager,
      EventsManager,
      OptionsManager,
      RefsManager,
      ServicesManager,
    };
  }

  /**
   * Call an instance method and emit corresponding events.
   */
  __callMethod(method: string, ...args: unknown[]): unknown {
    if (isDev) {
      this.__debug('callMethod', method, ...args);
    }

    this.$emit(method, ...args);

    // We always emit an event, but we do not call the method if it does not exist
    if (!isFunction(this[method])) {
      return null;
    }

    if (isDev) {
      this.__debug(method, this, ...args);
    }

    return this[method].call(this, ...args);
  }

  /**
   * Test if the given event has been bound to the instance.
   *
   * @param  {string} event The event's name.
   * @return {boolean}      Wether the given event has been bound or not.
   */
  __hasEvent(event: string): boolean {
    const eventHandlers = this.__eventHandlers.get(event);
    return eventHandlers && eventHandlers.size > 0;
  }

  /**
   * Class constructor where all the magic takes place.
   *
   * @param {HTMLElement} element The component's root element dd.
   */
  constructor(element: HTMLElement) {
    if (!element) {
      if (isDev) {
        throw new Error('The root element must be defined.');
      }
      return;
    }

    const { $config } = this;

    if ($config.name === 'Base') {
      if (isDev) {
        throw new Error('The `config.name` property is required.');
      }
      return;
    }

    this.$id = `${$config.name}-${id}`;
    id += 1;

    this.$el = element;

    if (!this.$el.__base__) {
      this.$el.__base__ = new Map();
    }

    this.$el.__base__.set($config.name, this);

    for (const service of ['Options', 'Services', 'Events', 'Refs', 'Children']) {
      this[`__${service.toLowerCase()}`] = new this.__managers[`${service}Manager`](this);
    }

    this.$on('mounted', () => {
      addInstance(this);
    });
    this.$on('destroyed', () => {
      deleteInstance(this);
    });

    if (isDev) {
      this.__debug('constructor', this);
    }
  }

  /**
   * Trigger the `mounted` callback.
   */
  async $mount(): Promise<this> {
    if (this.$isMounted || this.__isMounting) {
      return this;
    }

    this.__isMounting = true;
    this.$emit('before-mounted');

    if (isDev) {
      this.__debug('$mount');
    }

    await Promise.all([
      addToQueue(() => this.__children.registerAll()),
      addToQueue(() => this.__refs.registerAll()),
      addToQueue(() => this.__events.bindRootElement()),
      addToQueue(() => this.__services.enableAll()),
      addToQueue(() => this.__children.mountAll()),
    ]);

    await addToQueue(() => {
      this.$isMounted = true;
      this.__callMethod('mounted');
    });

    this.__isMounting = false;

    return this;
  }

  /**
   * Update the instance children.
   */
  async $update(): Promise<this> {
    if (isDev) {
      this.__debug('$update');
    }

    await Promise.all([
      // Undo
      addToQueue(() => this.__refs.unregisterAll()),
      addToQueue(() => this.__services.disableAll()),
      // Redo
      addToQueue(() => this.__children.registerAll()),
      addToQueue(() => this.__refs.registerAll()),
      addToQueue(() => this.__services.enableAll()),
      // Update
      addToQueue(() => this.__children.updateAll()),
    ]);

    await addToQueue(() => this.__callMethod('updated'));

    return this;
  }

  /**
   * Trigger the `destroyed` callback.
   */
  async $destroy(): Promise<this> {
    if (!this.$isMounted) {
      return this;
    }

    if (isDev) {
      this.__debug('$destroy');
    }

    this.$isMounted = false;

    await Promise.all([
      addToQueue(() => this.__events.unbindRootElement()),
      addToQueue(() => this.__refs.unregisterAll()),
      addToQueue(() => this.__services.disableAll()),
      addToQueue(() => this.__children.destroyAll()),
    ]);

    await addToQueue(() => this.__callMethod('destroyed'));

    return this;
  }

  /**
   * Terminate a child instance when it is not needed anymore.
   */
  async $terminate(): Promise<void> {
    if (isDev) {
      this.__debug('$terminate');
    }

    await Promise.all([
      // First, destroy the component.
      addToQueue(() => this.$destroy()),
      // Execute the `terminated` hook if it exists
      addToQueue(() => this.__callMethod('terminated')),
      // Delete instance
      addToQueue(() => this.$el.__base__.set(this.$config.name, 'terminated')),
    ]);
  }

  /**
   * Add an emitted event.
   *
   * @param  {string} event The event name.
   * @return {void}
   */
  __addEmits(event: string): void {
    const ctor = this.constructor;
    if (isArray(ctor.config.emits)) {
      ctor.config.emits.push(event);
    } else {
      ctor.config.emits = [event];
    }
  }

  /**
   * Remove an emitted event.
   *
   * @param  {string} event The event name.
   * @return {void}
   */
  __removeEmits(event: string): void {
    const ctor = this.constructor;
    const index = ctor.config.emits.indexOf(event);
    ctor.config.emits.splice(index, 1);
  }

  /**
   * Bind a listener function to an event.
   *
   * @param  {string} event
   *   Name of the event.
   * @param  {EventListenerOrEventListenerObject} listener
   *   Function to be called.
   * @param {boolean|AddEventListenerOptions} [options]
   *   Options for the `removeEventListener` method.
   * @return {() => void}
   *   A function to unbind the listener.
   */
  $on(
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): () => void {
    if (isDev) {
      this.__debug('$on', event, listener, options);
    }

    let set = this.__eventHandlers.get(event);

    if (!set) {
      set = new Set();
      this.__eventHandlers.set(event, set);
    }

    set.add(listener);

    const target = getEventTarget(this, event, this.__config);
    target?.addEventListener(event, listener, options);

    if (isDev) {
      if (!target) {
        console.warn(
          `[${this.$id}]`,
          `The "${event}" event is missing from the configuration and is not a native`,
          `event for the root element of type \`${this.$el.constructor.name}\`.`,
        );
      }
    }

    return () => {
      this.$off(event, listener, options);
    };
  }

  /**
   * Unbind a listener function from an event.
   *
   * @param {string} event
   *   Name of the event.
   * @param {EventListenerOrEventListenerObject} listener
   *   Function to be removed.
   * @param {boolean|EventListenerOptions} [options]
   *   Options for the `removeEventListener` method.
   * @return {void}
   */
  $off(
    event: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    if (isDev) {
      this.__debug('$off', event, listener);
    }

    this.__eventHandlers.get(event).delete(listener);

    const target = getEventTarget(this, event, this.__config);
    target?.removeEventListener(event, listener, options);
  }

  /**
   * Emits an event.
   *
   * @param  {string} event Name of the event.
   * @param  {any[]}  args  The arguments to apply to the functions bound to this event.
   * @return {void}
   */
  $emit(event: string | Event, ...args: unknown[]) {
    if (isDev) {
      this.__debug('$emit', event, args);
    }

    this.$el.dispatchEvent(
      event instanceof Event ? event : new CustomEvent(event, { detail: args }),
    );
  }

  /**
   * Register and mount all instances of the component.
   */
  static $register<T extends BaseProps = BaseProps, U extends typeof Base<T> = typeof Base<T>>(
    this: U,
    nameOrSelector?: string,
  ): Promise<InstanceType<U>>[] {
    return getComponentElements(nameOrSelector ?? this.config.name).map(
      async (el) =>
        getInstanceFromElement(el, this) ?? (new this(el).$mount() as Promise<InstanceType<U>>),
    );
  }
}
