/**
 * Gets all non-builtin properties up the prototype chain.
 *
 * @param {Object} object
 *   The object to get the propeties from.
 * @param {Array=} [props=[]]
 *   The already existing properties.
 * @param {(name:string, proto:any) => boolean} testFn
 * @return {Array<[String, Object]>} An array of properties and the prototype they belong to.
 */
export default function getAllProperties(object, props = [], testFn = null) {
  const proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype || proto === null) {
    return props;
  }

  let foundProps = Object.getOwnPropertyNames(proto);

  if (typeof testFn === 'function') {
    foundProps = foundProps.filter((name) => testFn(name, proto));
  }

  foundProps = foundProps.map((name) => [name, proto]).reduce((acc, val) => [...acc, val], props);

  return getAllProperties(proto, foundProps, testFn);
}
