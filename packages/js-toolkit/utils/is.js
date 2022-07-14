// eslint-disable-next-line no-undef
export const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Test if the given value is a function.
 *
 * @param   {unknown} value
 * @returns {value is Function}
 */
export const isFunction = (value) => typeof value === 'function';

/**
 * Test if a value is defined or not.
 *
 * @param   {unknown} value
 * @returns {boolean}
 */
export const isDefined = (value) => typeof value !== 'undefined';

/**
 * Test if value is a string.
 * @param   {unknown}  value
 * @returns {value is string}
 */
export const isString = (value) => typeof value === 'string';

/**
 * Test if the given value is an object.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isObject = (value) =>
  typeof value === 'object' && !!value && value.toString() === '[object Object]';

/**
 * Test if a given value is a number.
 *
 * @param   {unknown}  value
 * @returns {value is number}
 */
export const isNumber = (value) => typeof value === 'number';

/**
 * Test if a given value is a boolean.
 * @param   {unknown}  value
 * @returns {value is boolean}
 */
export const isBoolean = (value) => typeof value === 'boolean';

// eslint-disable-next-line prefer-destructuring
export const isArray = Array.isArray;
