import _typeof from "@babel/runtime/helpers/typeof";

/**
 * Test if the given value is an object.
 *
 * @param  {*}       value The value to test.
 * @return {Boolean}       Whether or not the value is an object.
 */
export default function isObject(value) {
  return _typeof(value) === 'object' && !!value && value.toString() === '[object Object]';
}
//# sourceMappingURL=isObject.js.map