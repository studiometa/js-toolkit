// eslint-disable-next-line no-undef
/**
 * @link https://js-toolkit.studiometa.dev/utils/is/isDev.html
 */
export const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Test is the given value is null.
 * @link https://js-toolkit.studiometa.dev/utils/is/isNull.html
*/
export const isNull = (value: unknown): value is null => value === null;

/**
 * Test if the given value is a function.
 * @link https://js-toolkit.studiometa.dev/utils/is/isFunction.html
*/
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function => typeof value === 'function';

/**
 * Test if a value is defined or not.
 * @link https://js-toolkit.studiometa.dev/utils/is/isDefined.html
*/
export const isDefined = (value: unknown): boolean => typeof value !== 'undefined';

/**
 * Test if value is a string.
 * @link https://js-toolkit.studiometa.dev/utils/is/isString.html
*/
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Test if the given value is an object.
 * @link https://js-toolkit.studiometa.dev/utils/is/isObject.html
*/
export const isObject = (value: unknown): boolean =>
  typeof value === 'object' && !!value && value.toString() === '[object Object]';

/**
 * Test if a given value is a number.
 * @link https://js-toolkit.studiometa.dev/utils/is/isNumber.html
*/
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !Number.isNaN(value);

/**
 * Test if a given value is a boolean.
 * @link https://js-toolkit.studiometa.dev/utils/is/isBoolean.html
*/
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

// eslint-disable-next-line prefer-destructuring
/**
 * Test if a given value is an array.
 * @link https://js-toolkit.studiometa.dev/utils/is/isArray.html
*/
export const isArray = Array.isArray;

/**
 * Test if a given value is an empty string.
 * @link https://js-toolkit.studiometa.dev/utils/is/isEmptyString.html
*/
export const isEmptyString = (value?: unknown): boolean => isString(value) && value.length === 0;

/**
 * Test if the given value is empty.
 * @link https://js-toolkit.studiometa.dev/utils/is/isEmpty.html
*/
export const isEmpty = (value?) => {
  if (isNull(value) || !isDefined(value)) {
    return true;
  }

  if (isString(value) || isArray(value)) {
    return value.length === 0;
  }

  if (isObject(value)) {
    return value.constructor === Object && Object.keys(value).length === 0;
  }

  return false;
};
