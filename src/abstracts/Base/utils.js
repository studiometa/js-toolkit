/**
 * Verbose debug for the component.
 *
 * @param  {...any} args The arguments passed to the method
 * @return {void}
 */
export function debug(instance, ...args) {
  return instance.$options.debug
    ? window.console.log.apply(window, [instance.config.name, ...args])
    : () => {};
}

/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj The object to test
 * @param  {String}  fn  The method's name
 * @return {Boolean}
 */
export function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}

/**
 * Call the given method while applying the given arguments.
 *
 * @param {String} method The method to call
 * @param {...any} args   The arguments to pass to the method
 */
export function callMethod(instance, method, ...args) {
  debug(instance, 'callMethod', method, ...args);

  // Prevent duplicate call of `mounted` and `destroyed`
  // methods based on the component status
  if (
    (method === 'destroyed' && !instance.$isMounted) ||
    (method === 'mounted' && instance.$isMounted)
  ) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit(method, ...args);

  // We always emit an event, but we do not call the method if it does not exist
  if (!hasMethod(instance, method)) {
    return instance;
  }

  instance[method].call(instance, ...args);
  debug(instance, method, instance, ...args);

  return instance;
}
