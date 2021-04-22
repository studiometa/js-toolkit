/**
 * Gets all non-builtin properties up the prototype chain.
 *
 * @param  {Object} object The object to get the propeties from.
 * @param  {Array=} [props=[]] The already existing properties.
 * @return {Array<[String, Object]>} An array of properties and the prototype they belong to.
 */
export default function getAllProperties(object, props = []) {
  const proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype) {
    return props;
  }

  return getAllProperties(
    proto,
    Object.getOwnPropertyNames(proto)
      .map((name) => [name, proto])
      .reduce((acc, val) => [...acc, val], props)
  );
}
