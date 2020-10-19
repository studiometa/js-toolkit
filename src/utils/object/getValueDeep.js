/**
 * Get an object deep value by giving its path.
 *
 * @param  {Object}    obj  The object to get the value from.
 * @param  {String}    path The dotted path of the value.
 * @return {any|false}      The value, of false if it was not found.
 */
export default function getValueDeep(obj, path) {
  if (!path) {
    return obj;
  }

  const keys = path.split('.');
  let data = obj;

  while (keys.length) {
    if (data === undefined) {
      return false;
    }

    data = data[keys.shift()];
  }

  return data || false;
}
