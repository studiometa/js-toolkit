import { isFunction } from './is.js';

/**
 * Default component resolver
 *
 * @param {Function} fn
 * @return {Function}
 */
export function getComponentResolver(fn) {
  return (resolve, cb?: () => unknown) => {
    fn().then((module) => {
      const ResolvedClass = module.default ?? module;
      resolve(ResolvedClass);

      if (isFunction(cb)) {
        cb();
      }
    });
  };
}
