import { createService, type Service } from '../services/service.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';

/** One lazy service per window event name. */
const services = /* @__PURE__ */ getSharedRuntimeSlot<Map<string, Service<void>>>(
  'storage:sync',
  1,
  () => new Map(),
);

/**
 * Announce out-of-band storage changes.
 *
 * The event carries no state a subscriber can use — a `StorageEvent` names one
 * key, a `hashchange` names none — so subscribers re-read what they hold. The
 * service exists for its refcounting: the listener is attached while at least
 * one storage observes this event, and released with the last of them. Held in
 * a shared slot so every storage in the page shares one listener per event.
 *
 * `createStorage` is the only caller. A provider declares `syncEvents` and is
 * wired up for it.
 *
 * @internal
 */
export function useStorageSync(eventName: string): Service<void> {
  let service = services.get(eventName);

  if (!service) {
    service = createService<void>({
      props: () => undefined,
      // There is no value to replay, so `immediate` never delivers.
      hasProps: () => false,
      start(emit) {
        const publish = () => emit();
        window.addEventListener(eventName, publish);
        return () => window.removeEventListener(eventName, publish);
      },
    });
    services.set(eventName, service);
  }

  return service;
}
