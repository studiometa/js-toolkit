import usePointer from '../../services/pointer.js';
import useRaf from '../../services/raf.js';
import useResize from '../../services/resize.js';
import useScroll from '../../services/scroll.js';
import useKey from '../../services/key.js';
import useLoad from '../../services/load.js';
import { hasMethod } from '../utils.js';

/**
 * @typedef {import('../index').default} Base
 * @typedef {import('../../services').ServiceInterface} ServiceInterface
 */

/**
 * @type {Record<string, () => ServiceInterface>}
 */
const SERVICES_MAP = {
  scrolled: useScroll,
  resized: useResize,
  ticked: useRaf,
  moved: usePointer,
  keyed: useKey,
  loaded: useLoad,
};

const SERVICE_NAMES = Object.keys(SERVICES_MAP);

/**
 * @typedef {keyof SERVICES_MAP} ServiceName
 */

/**
 * Services management for the Base class.
 */
export default class ServicesManager {
  /**
   * @type {Base}
   * @private
   */
  __base;

  /**
   * @type {Record<string, () => ServiceInterface>}
   */
  __customServices = {};

  /**
   * @return {Record<string, () => ServiceInterface>}
   */
  get __services() {
    return {
      ...this.__customServices,
      ...SERVICES_MAP,
    };
  }

  /**
   * Class constructor.
   * @param {Base} instance The Base instance.
   */
  constructor(instance) {
    Object.defineProperties(this, {
      __base: {
        enumerable: false,
        writable: false,
        value: instance,
      },
    });
  }

  /**
   * Test if the given service is registered.
   *
   * @param  {ServiceName} service The name of the service.
   * @return {Boolean}
   */
  has(service) {
    if (!hasMethod(this.__base, service) && !this.__services[service]) {
      return false;
    }

    const { has } = this.__services[service]();
    return has(this.__base.$id);
  }

  /**
   * Init the given service and bind it to the given instance.
   *
   * @param  {ServiceName} service The name of the service.
   * @return {() => void}          A function to unbind the service.
   */
  enable(service) {
    if (this.has(service)) {
      return this.disable.bind(this, service);
    }

    if (!hasMethod(this.__base, service) || !this.__services[service]) {
      return function noop() {};
    }

    const { add } = this.__services[service]();
    const self = this;

    /**
     * @param {any[]} args
     */
    function serviceHandler(...args) {
      // @ts-ignore
      self.__base.__callMethod(service, ...args);
    }

    add(this.__base.$id, serviceHandler);

    return this.disable.bind(this, service);
  }

  /**
   * Enable all services and return methods to disable them.
   *
   * @return {Function[]}
   */
  enableAll() {
    return Object.keys(this.__services).map(
      /** @param {ServiceName} serviceName */
      (serviceName) => this.enable(serviceName)
    );
  }

  /**
   * Disable all services.
   *
   * @return {void}
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
   * @param  {String} service  The name of the service.
   * @return {void}
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
   * @return {void}
   */
  toggle(service, force) {
    if (typeof force !== 'undefined') {
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
  }

  /**
   * Unregister a new service to be enabled disabled.
   *
   * @param {string} name
   *   The name of the service hook.
   */
  unregister(name) {
    if (SERVICE_NAMES.includes(name)) {
      throw new Error(`[ServicesManager] The \`${name}\` core service can not be unregistered.`);
    }

    delete this.__customServices[name];
  }
}
