/**
 * Test if the given value is an object.
 *
 * @param {*} value The value to test.
 * @returns {boolean} Whether or not the value is an object.
 */
export default function isObject(value) {
  return typeof value === 'object' && !!value && value.toString() === '[object Object]';
}
