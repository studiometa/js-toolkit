// eslint-disable-next-line no-undef
export const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

/**
 * Test if the given value is a function.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = (value: unknown): value is Function => typeof value === 'function';

/**
 * Test if a value is defined or not.
 */
export const isDefined = (value: unknown): boolean => typeof value !== 'undefined';

/**
 * Test if value is a string.
 */
export const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Test if the given value is an object.
 */
export const isObject = (value: unknown): boolean =>
  typeof value === 'object' && !!value && value.toString() === '[object Object]';

/**
 * Test if a given value is a number.
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !Number.isNaN(value);

/**
 * Test if a given value is a boolean.
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

// eslint-disable-next-line prefer-destructuring
export const isArray = Array.isArray;
