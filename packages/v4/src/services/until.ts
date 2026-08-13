import type { Service, Unsubscribe } from './service.js';

/**
 * Wait for a service to report props that satisfy a predicate.
 *
 * `isScrolling` exists so that a component waiting for a scroll to finish can
 * rely on it, and there was nothing to wait *with*:
 *
 * ```js
 * await until(useScroll(), ({ isScrolling }) => !isScrolling);
 * await until(useDrag(el), ({ mode }) => mode === DRAG_MODES.STOP);
 * ```
 *
 * It consumes a `Service<T>` and nothing else, so it works on every source and
 * on anything else built with `createService()` — which is the point of the
 * services sharing one interface.
 *
 * Two things make it worth shipping rather than leaving to each caller:
 *
 * - **The obvious hand-rolled version does not compile, and the version that
 *   does is subtly wrong.** Releasing the subscription from inside the callback
 *   means naming the unsubscribe before `subscribe()` has returned it — a
 *   temporal dead zone, `ReferenceError` at the first matching update. Hoisting
 *   it to a `let` fixes the crash and not the case where the match arrives
 *   *during* `subscribe()`, which `{ immediate: true }` makes ordinary: the
 *   binding is then still `null`, so the subscription is never released and the
 *   service it holds never stops.
 * - **The props object belongs to its service** and is valid for the duration
 *   of the call that received it. A promise resolves on a later microtask, by
 *   which time a sampled source may well have overwritten it, so the resolved
 *   value is a copy.
 *
 * It resolves on the **current** props when they already match — asking whether
 * a scroll has finished must not wait for the next scroll to answer — through
 * the same `{ immediate: true }` the sources gate on. A source with no current
 * value has nothing to match against and simply waits for its first update.
 *
 * A predicate that never matches holds its subscription, and therefore its
 * service, for as long as the promise is unresolved: this is a subscription
 * with the same contract as any other, minus a handle to release early. Wait
 * for something that is bound to happen.
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
      // `null` while this runs from inside `subscribe()` — the immediate
      // delivery below — and the tail of this function releases it in that
      // case. Either way the subscription is released before the promise
      // resolves, so nothing observes a match twice.
      unsubscribe?.();
      // A copy, since the object is the service's and the `await` resumes a
      // microtask later. Guarded, because a service's props are whatever its
      // type parameter says — spreading a number would resolve `{}`.
      resolve(typeof props === 'object' && props !== null ? { ...props } : props);
    };

    unsubscribe = service.subscribe(check, { immediate: true });
    if (isSettled) {
      unsubscribe();
    }
  });
}
