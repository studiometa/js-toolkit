import AbstractManager from './AbstractManager.js';
import { noop, isFunction, isDefined } from '../../utils/index.js';

/**
 * @typedef {import('../index').default} Base
 * @typedef {import('../index').BaseConstructor} BaseConstructor
 * @typedef {import('../../services').ServiceInterface<any>} ServiceInterface
 */

/**
 * @typedef {Record<string, () => ServiceInterface>} Services
 * @typedef {string} ServiceName
 */

/**
 * Services management for the Base class.
 *
 * @todo Add support for disabled services on mount when the method is defined.
 */
export default class ServicesManager extends AbstractManager {
  /**
   * @type {Record<string, () => ServiceInterface>}
   */
  __customServices = {};

  /**
   * @returns {Record<string, () => ServiceInterface>}
   */
  get __services() {
    return { ...this.__customServices };
  }

  /**
   * Test if the given service is registered.
   *
   * @param  {ServiceName} service The name of the service.
   * @returns {boolean}
   */
  has(service) {
    if (
      !(
        (isFunction(this.__base[service]) ||
          // @ts-ignore
          this.__base.__hasEvent(service)) &&
        this.__services[service]
      )
    ) {
      return false;
    }

    const { has } = this.__services[service]();
    return has(this.__base.$id);
  }

  /**
   * Get a service props by name.
   * @param   {ServiceName} service The name of the service.
   * @returns {ReturnType<ServiceInterface['props']>}
   */
  get(service) {
    return this.__services[service]().props();
  }

  /**
   * Init the given service and bind it to the given instance.
   *
   * @param  {ServiceName} service The name of the service.
   * @returns {() => void}          A function to unbind the service.
   */
  enable(service) {
    if (this.has(service)) {
      return this.disable.bind(this, service);
    }

    if (
      // @ts-ignore
      !(isFunction(this.__base[service]) || this.__base.__hasEvent(service)) ||
      !this.__services[service]
    ) {
      return noop;
    }
    const { add } = this.__services[service]();
    const self = this;

    /**
     * @param {any[]} args
     * @returns {unknown}
     */
    function serviceHandler(...args) {
      // @ts-ignore
      return self.__base.__callMethod(service, ...args);
    }

    add(this.__base.$id, serviceHandler);

    return this.disable.bind(this, service);
  }

  /**
   * Enable all services and return methods to disable them.
   *
   * @returns {Function[]}
   */
  enableAll() {
    return Object.keys(this.__services).map(
      /**
       * @param {ServiceName} serviceName
       * @returns {() => void}
       */
      (serviceName) => this.enable(serviceName)
    );
  }

  /**
   * Disable all services.
   *
   * @returns {void}
   */
  disableAll() {
    Object.keys(this.__services).forEach(
      /** @param {ServiceName} serviceName */
      (serviceName) => {
        this.disable(serviceName);
      }
    );
  }

  /**
   * Disable a service.
   *
   * @param  {string} service  The name of the service.
   * @returns {void}
   */
  disable(service) {
    if (!this.__services[service]) {
      return;
    }

    const { remove } = this.__services[service]();
    remove(this.__base.$id);
  }

  /**
   * Toggle a service.
   * @param  {string}  service    The name of the service.
   * @param  {boolean} [force] The state to force.
   * @returns {void}
   */
  toggle(service, force) {
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
   * @param {() => ServiceInterface} useFunction
   *   The `use...` function for the service.
   */
  register(name, useFunction) {
    this.__customServices[name] = useFunction;
    // @ts-ignore
    this.__base.__addEmits(name);
  }

  /**
   * Unregister a new service to be enabled disabled.
   *
   * @param {string} name
   *   The name of the service hook.
   */
  unregister(name) {
    // @ts-ignore
    this.__base.__removeEmits(name);
    delete this.__customServices[name];
  }
}
