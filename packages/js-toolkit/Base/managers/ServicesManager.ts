import { usePointer, useRaf, useResize, useScroll, useKey } from '../../services/index.js';
import type {
  PointerServiceInterface,
  RafServiceInterface,
  ResizeServiceInterface,
  ScrollServiceInterface,
  KeyServiceInterface,
  ServiceInterface,
} from '../../services/index.js';
import { AbstractManager } from './AbstractManager.js';
import { noop, isFunction, isDefined, isDev } from '../../utils/index.js';

const SERVICES_MAP = {
  scrolled: useScroll,
  resized: useResize,
  ticked: useRaf,
  moved: usePointer,
  keyed: useKey,
};

const SERVICE_NAMES = Object.keys(SERVICES_MAP);

type Services = {
  scrolled: ScrollServiceInterface;
  resized: ResizeServiceInterface;
  ticked: RafServiceInterface;
  moved: PointerServiceInterface;
  keyed: KeyServiceInterface;
} & Record<string, ServiceInterface<unknown>>;

type ServiceProps = typeof SERVICES_MAP & Record<string, <T>() => ServiceInterface<T>>;

type ServiceNames = keyof Services;

/**
 * Services management for the Base class.
 *
 * @todo Add support for disabled services on mount when the method is defined.
 */
export class ServicesManager extends AbstractManager<ServiceProps> {
  /**
   * Custom props
   * @private
   */
  __props = {
    ...SERVICES_MAP,
  } as ServiceProps;

  /**
   * Test if the given service is registered.
   */
  has(service: ServiceNames | string): boolean {
    if (
      !(
        (isFunction(this.__base[service]) ||
          // @ts-ignore
          this.__base.__hasEvent(service)) &&
        this.props[service]
      )
    ) {
      return false;
    }

    const { has } = this.props[service]();
    return has(this.__base.$id);
  }

  /**
   * Get a service props by name.
   */
  get<S extends ServiceNames | string>(service: S): ReturnType<Services[S]['props']> {
    // @ts-ignore
    return this.props[service]().props();
  }

  /**
   * Init the given service and bind it to the given instance.
   *
   * @param  {ServiceNames} service The name of the service.
   * @return {() => void}          A function to unbind the service.
   */
  enable(service: ServiceNames): () => void {
    if (this.has(service)) {
      return this.disable.bind(this, service);
    }

    if (
      // @ts-ignore
      !(isFunction(this.__base[service]) || this.__base.__hasEvent(service)) ||
      !this.props[service]
    ) {
      return noop;
    }
    const serviceInstance = this.props[service]();

    serviceInstance.add(this.__base.$id, (...args) => this.__base.__callMethod(service, ...args));

    return this.disable.bind(this, service);
  }

  /**
   * Enable all services and return methods to disable them.
   */
  enableAll() {
    return Object.keys(this.props).map((serviceName) => this.enable(serviceName));
  }

  /**
   * Disable all services.
   *
   * @return {void}
   */
  disableAll() {
    for (const serviceName of Object.keys(this.props)) {
      this.disable(serviceName);
    }
  }

  /**
   * Disable a service.
   */
  disable(service: ServiceNames) {
    if (!this.props[service]) {
      return;
    }

    const { remove } = this.props[service]();
    remove(this.__base.$id);
  }

  /**
   * Toggle a service.
   */
  toggle(service: ServiceNames, force?: boolean) {
    if (isDefined(force)) {
      if (force && !this.has(service)) {
        this.enable(service);
      }

      if (!force && this.has(service)) {
        this.disable(service);
      }
    } else if (this.has(service)) {
      this.disable(service);
    } else {
      this.enable(service);
    }
  }

  /**
   * Register a new service to be enabled/disabled.
   *
   * @param {string} name
   *   The name of the service hook.
   * @param {<T>(...args:unknown[]) => ServiceInterface<T>} useFunction
   *   The `use...` function for the service.
   */
  register(name: string, useFunction: <T>(...args: unknown[]) => ServiceInterface<T>) {
    this.props[name] = useFunction;
    this.__base.__addEmits(name);
  }

  /**
   * Unregister a new service to be enabled disabled.
   *
   * @param {string} name
   *   The name of the service hook.
   */
  unregister(name: string) {
    if (SERVICE_NAMES.includes(name)) {
      if (isDev) {
        throw new Error(`[ServicesManager] The \`${name}\` core service can not be unregistered.`);
      }
      return;
    }

    this.__base.__removeEmits(name);
    delete this.props[name];
  }
}
