/**
 * Test if the given value is an object.
 *
 * @param  {any}     value The value to test.
 * @return {Boolean}       Whether or not the value is an object.
 */
export default function isObject(value): boolean {
  const type = typeof value;
  return type === 'function' || (type === 'object' && !!value);
}
