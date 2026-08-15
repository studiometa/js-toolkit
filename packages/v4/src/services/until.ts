import type { Service, Unsubscribe } from './service.js';

/**
 * Wait for current or future service props that satisfy a predicate.
 *
 * The subscription is released before resolution. Object props are copied because services can reuse them.
 */
export function until<T>(service: Service<T>, predicate: (props: T) => boolean): Promise<T> {
  return new Promise<T>((resolve) => {
    let unsubscribe: Unsubscribe | null = null;
    let isSettled = false;

    const check = (props: T) => {
      if (isSettled || !predicate(props)) {
        return;
      }
      isSettled = true;
      // Immediate delivery can match before `subscribe()` returns its release function.
      unsubscribe?.();
      // Copy objects before the service can reuse them. Preserve primitive values.
      resolve(typeof props === 'object' && props !== null ? { ...props } : props);
    };

    unsubscribe = service.subscribe(check, { immediate: true });
    if (isSettled) {
      unsubscribe();
    }
  });
}
