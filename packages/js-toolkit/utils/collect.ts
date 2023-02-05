import { isFunction, isString, isDefined, isDev } from './is.js';

type KeysOfType<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

type fn = (...args: unknown[]) => unknown;

export type Collection<T> = Array<T> & {
  [key in KeysOfType<T, fn>]: (
    // @ts-ignore
    ...args: Parameters<T[KeysOfType<T, fn>]>
  ) => // @ts-ignore
  Array<ReturnType<T[KeysOfType<T, fn>]>>;
};

const PREFIX = '$$';
const PREFIX_RE = /^\$\$/;

export function collect<T>(arr: T[]): Collection<T> {
  return new Proxy(arr, {
    get(target, prop): unknown {
      if (isDefined(target[prop]) || (isString(prop) && !prop.startsWith(PREFIX))) {
        if (isFunction(target[prop])) {
          // eslint-disable-next-line func-names
          return function (...args) {
            const result = target[prop](...args);
            return Array.isArray(result) ? collect(result) : result;
          };
        }

        return target[prop];
      }

      if (!isString(prop)) {
        if (isDev) {
          console.warn('[collect] Can not access Symbol method.');
        }
        // eslint-disable-next-line consistent-return
        return;
      }

      const unprefixedProp = prop.replace(PREFIX_RE, '');
      const [model] = target;

      if (!isFunction(model[unprefixedProp])) {
        if (isDev) {
          console.warn('[collect] Can not access properties.');
        }
        // eslint-disable-next-line consistent-return
        return;
      }

      return (...args) => target.map((t) => t[unprefixedProp](...args));
    },
  }) as Collection<T>;
}
