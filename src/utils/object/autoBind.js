import getAllProperties from './getAllProperties';

/**
 * Auto-bind methods to an instance.
 *
 * @param  {Object}               instance          The instance.
 * @param  {Object}               options           Specify methods to include or exlude.
 * @param  {Array<String|RegExp>} [options.include] Methods to include.
 * @param  {Array<String|RegExp>} [options.exclude] Methods to exclude.
 * @return {Object}                                 The instance.
 */
export default function autoBind(instance, options) {
  const { exclude, include } = options || {};
  const filter = (key) => {
    const match = (pattern) => (typeof pattern === 'string' ? key === pattern : pattern.test(key));

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
      if (descriptor && typeof descriptor.value === 'function') {
        instance[key] = instance[key].bind(instance);
      }
    });

  return instance;
}
