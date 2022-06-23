// eslint-disable-next-line jsdoc/require-returns
/**
 * Use a service.
 * @template {Record<string, any>} T
 * @param   {{ init: () => void, kill: () => void, props: T }} options
 */
export function useService(options) {
  /**
   * @type {Map<string, (props:T) => any>}
   */
  const callbacks = new Map();
  let isInit = false;

  const { init, kill, props } = options;

  /**
   * Does the service has the given key?
   * @param   {string}  key
   * @returns {boolean}
   */
  function has(key) {
    return callbacks.has(key);
  }

  /**
   * Get a service callback by its key.
   * @param   {string} key
   * @returns {(props:T) => any}
   */
  function get(key) {
    return callbacks.get(key);
  }

  /**
   * Add a callback to the service.
   * @param {string}   key
   * @param {(props:T) => any} callback
   */
  function add(key, callback) {
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
   * @param   {string} key
   * @returns {void}
   */
  function remove(key) {
    callbacks.delete(key);

    // Kill the service when we remove the last callback
    if (callbacks.size === 0 && isInit) {
      kill();
      isInit = false;
    }
  }

  /**
   * Trigger all service callbacks with service props.
   * @param {T} p
   * @returns {void}
   */
  function trigger(p) {
    callbacks.forEach(function forEachCallback(callback) {
      callback(p);
    });
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
