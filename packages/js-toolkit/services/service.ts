// eslint-disable-next-line jsdoc/require-returns
import type { ServiceInterface } from './index.js';

export interface ServiceOptions<T> {
  init: () => void;
  kill: () => void;
  props: T;
}

export interface UseServiceInterface<T> extends Omit<ServiceInterface<T>, 'props'> {
  callbacks: Map<string, (props: T) => unknown>;
  props: T;
  get: (key: string) => (props: T) => unknown;
  trigger: (props: T) => unknown;
}

/**
 * Use a service.
 */
export function useService<T>(options: ServiceOptions<T>): UseServiceInterface<T> {
  const callbacks: Map<string, (props: T) => unknown> = new Map();
  let isInit = false;

  const { init, kill, props } = options;

  /**
   * Does the service has the given key?
   */
  function has(key: string): boolean {
    return callbacks.has(key);
  }

  /**
   * Get a service callback by its key.
   */
  function get(key: string): (props: T) => unknown {
    return callbacks.get(key);
  }

  /**
   * Add a callback to the service.
   */
  function add(key: string, callback: (props: T) => unknown) {
    if (has(key)) {
      console.warn(`The key \`${key}\` has already been added.`);
      return;
    }

    // Initialize the service when we add the first callback
    if (callbacks.size === 0 && !isInit) {
      init();
      isInit = true;
    }

    callbacks.set(key, callback);
  }

  /**
   * Remove a callback from the service by its key.
   */
  function remove(key: string) {
    callbacks.delete(key);

    // Kill the service when we remove the last callback
    if (callbacks.size === 0 && isInit) {
      kill();
      isInit = false;
    }
  }

  /**
   * Trigger all service callbacks with service props.
   */
  function trigger(p: T) {
    for (const callback of callbacks.values()) {
      callback(p);
    }
  }

  return {
    callbacks,
    props,
    add,
    remove,
    has,
    get,
    trigger,
  };
}
