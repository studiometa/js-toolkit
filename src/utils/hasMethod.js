/**
 * Test if an object has a method.
 *
 * @param  {Object}  obj The object to test
 * @param  {String}  fn  The method's name
 * @return {Boolean}
 */
export default function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}
