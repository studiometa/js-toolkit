import { isFunction } from './index.js';

/**
 * Default component resolver
 *
 * @param fn
 * @returns
 */
export default function getComponentResolver(fn) {
  console.log('getComponentResolver');
  return (resolve, cb?: () => unknown) => {
    fn().then((module) => {
      const ResolvedClass = 'default' in module ? module.default : module;
      resolve(ResolvedClass);

      if (isFunction(cb)) {
        cb();
      }
    });
  };
}
