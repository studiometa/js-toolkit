// eslint-disable-next-line no-undef
export const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Get the type of value.
 * @param   {unknown} value
 * @returns {string}
 */
function type(value) {
  return typeof value;
}

/**
 * Test if the given value is a function.
 *
 * @param   {unknown} value
 * @returns {fn is Function}
 */
export function isFunction(value) {
  return type(value) === 'function';
}

/**
 * Test if a value is defined or not.
 *
 * @param   {unknown} value
 * @returns {boolean}
 */
export function isDefined(value) {
  return type(value) !== 'undefined';
}

/**
 * Test if value is a string.
 * @param   {unknown}  value
 * @returns {value is string}
 */
export function isString(value) {
  return type(value) === 'string';
}

/**
 * Test if the given value is an object.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isObject(value) {
  return type(value) === 'object' && !!value && value.toString() === '[object Object]';
}

/**
 * Test if a given value is a number.
 *
 * @param   {unknown}  value
 * @returns {value is number}
 */
export function isNumber(value) {
  return type(value) === 'number';
}

/**
 * Test if a given value is a boolean.
 * @param   {unknown}  value
 * @returns {value is boolean}
 */
export function isBoolean(value) {
  return type(value) === 'boolean';
}

export const isArray = Array.isArray;
