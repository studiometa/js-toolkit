import usePointer from '../../../services/pointer';
import useRaf from '../../../services/raf';
import useResize from '../../../services/resize';
import useScroll from '../../../services/scroll';
import useKey from '../../../services/key';
import useLoad from '../../../services/load';
import { hasMethod, callMethod } from '../utils';

/**
 * @typedef {import('../index').default} Base
 */

const SERVICES_MAP = {
  scrolled: useScroll,
  resized: useResize,
  ticked: useRaf,
  moved: usePointer,
  keyed: useKey,
  loaded: useLoad,
};

/**
 * @typedef {'scrolled'|'resized'|'ticked'|'moved'|'keyed'} ServiceName
 */

/**
 * Services management for the Base class.
 */
export default class Services {
  /** @type {Base} */
  #base;

  /**
   * Class constructor.
   * @param {Base} instance The Base instance.
   */
  constructor(instance) {
    this.#base = instance;
  }

  /**
   * Test if the given service is registered.
   *
   * @param  {ServiceName} service The name of the service.
   * @return {Boolean}
   */
  has(service) {
    if (!hasMethod(this.#base, service) && !SERVICES_MAP[service]) {
      return false;
    }

    const { has } = SERVICES_MAP[service]();
    return has(this.#base.$id);
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

    if (!hasMethod(this.#base, service) || !SERVICES_MAP[service]) {
      return function noop() {};
    }

    const { add } = SERVICES_MAP[service]();
    const self = this;

    /**
     * @param {any[]} args
     */
    function serviceHandler(...args) {
      callMethod(self.#base, service, ...args);
    }

    add(this.#base.$id, serviceHandler);

    return this.disable.bind(this, service);
  }

  /**
   * Enable all services and return methods to disable them.
   *
   * @return {Function[]}
   */
  enableAll() {
    return Object.keys(SERVICES_MAP).map(
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
    Object.keys(SERVICES_MAP).forEach(
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
    if (!SERVICES_MAP[service]) {
      return;
    }

    const { remove } = SERVICES_MAP[service]();
    remove(this.#base.$id);
  }
}
