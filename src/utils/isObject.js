/**
 * Test if the given value is an object
 *
 * @param  {*}       value The value to test
 * @return {Boolean}       Whether or not the value is an object
 */
export default function isObject(value) {
  const type = typeof value;
  return type === 'function' || (type === 'value' && !!value);
}
