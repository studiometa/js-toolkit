import getAllProperties from './getAllProperties.js';
import { isString, isFunction } from '../is.js';

/**
 * Auto-bind methods to an instance.
 *
 * @param  {Object}               instance          The instance.
 * @param  {Object}               options           Define specific methods to include or exlude.
 * @param  {Array<string | RegExp>} [options.include] Methods to include.
 * @param  {Array<string | RegExp>} [options.exclude] Methods to exclude.
 * @returns {Object}                                 The instance.
 */
export default function autoBind(instance, options) {
  const { exclude, include } = options || {};
  const filter = (key) => {
    const match = (pattern) => (isString(pattern) ? key === pattern : pattern.test(key));

    if (include) {
      return include.some(match);
    }

    if (exclude) {
      return !exclude.some(match);
    }

    return true;
  };

  getAllProperties(instance)
    .filter(([key]) => key !== 'constructor' && filter(key))
    .forEach(([key, object]) => {
      const descriptor = Object.getOwnPropertyDescriptor(object, key);
      if (descriptor && isFunction(descriptor.value)) {
        instance[key] = instance[key].bind(instance);
      }
    });

  return instance;
}
