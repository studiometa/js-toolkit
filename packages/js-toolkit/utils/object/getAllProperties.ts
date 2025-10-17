import { isFunction } from '../is.js';

/**
 * Gets all non-builtin properties up the prototype chain.
 *
 * @param {Object} object
 *   The object to get the propeties from.
 * @param {Array} [props=[]]
 *   The already existing properties.
 * @param {(name:string, proto:any) => boolean} testFn
 * @return {Array<[string, Object]>} An array of properties and the prototype they belong to.
 */
export function getAllProperties(
  object: unknown,
  props: Array<[string, unknown]> = [],
  testFn: (name: string, proto: unknown) => boolean = null,
): Array<[string, unknown]> {
  const proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype || proto === null) {
    return props;
  }

  let foundProps = Object.getOwnPropertyNames(proto);

  if (isFunction(testFn)) {
    foundProps = foundProps.filter((name) => testFn(name, proto));
  }

  const formatedProps = foundProps
    .map<[string, unknown]>((name) => [name, proto])
    .reduce<Array<[string, unknown]>>((acc, val) => [...acc, val], props);

  return getAllProperties(proto, formatedProps, testFn);
}
