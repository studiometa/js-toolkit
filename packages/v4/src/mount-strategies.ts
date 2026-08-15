import { defaultScheduler } from './scheduler.js';

/**
 * When an instance mounts, independently of when its class was loaded.
 *
 * One-shot strategies mount once and stay mounted; reversible ones mount
 * and unmount as their condition flips, which the lifecycle already
 * supports — `$destroy()` is the reversible inverse of `$mount()`, and the
 * same instance comes back.
 *
 * | strategy                 | mounts when                       | reversible |
 * | ------------------------ | --------------------------------- | ---------- |
 * | `eager`                  | the element enters the DOM        | no         |
 * | `visible[:<rootMargin>]` | it first intersects the viewport  | no         |
 * | `in-view[:<rootMargin>]` | it intersects the viewport        | yes        |
 * | `idle`                   | the main thread goes idle         | no         |
 * | `interaction`            | the user first aims at it         | no         |
 * | `media:<q>`              | the media query matches           | yes        |
 *
 * The optional viewport suffix is passed as
 * `IntersectionObserverInit.rootMargin`. An empty suffix is the same as the
 * bare strategy. `visible` and `in-view` are deliberately separate:
 * re-mounting is right for a scroll animation and destructive for a map, a
 * video or a form.
 */
export type MountStrategy =
  | 'eager'
  | 'visible'
  | `visible:${string}`
  | 'in-view'
  | `in-view:${string}`
  | 'idle'
  | 'interaction'
  | `media:${string}`;

export const MOUNT_ATTRIBUTE = 'data-mount';

/**
 * Intent events, so a component is mounted before the interaction it was
 * waiting for completes: `pointerdown` precedes `click`, `focusin`
 * precedes typing.
 *
 * Note that `pointerenter` also fires when an element appears under a
 * resting cursor, which mounts it without the user having moved. That is
 * intent as far as the pointer is concerned — it is over the element — but
 * it does mean an element inserted under the mouse mounts immediately.
 */
const INTENT_EVENTS = ['pointerenter', 'pointerdown', 'focusin'] as const;

export interface MountStrategyHooks {
  mount(): void;
  destroy(): void;
}

export type AppliedMountStrategy =
  | {
      readonly valid: true;
      dispose(): void;
      /** Work which mounts eagerly; conditional strategies never expose one. */
      eagerWork?: Promise<unknown>;
      error?: never;
    }
  | {
      readonly valid: false;
      dispose(): void;
      eagerWork?: never;
      /** The original error for the registry diagnostic. */
      error: unknown;
    };

interface ViewportMountStrategy {
  isReversible: boolean;
  rootMargin?: string;
}

/** Parse the two viewport strategy forms at their shared execution seam. */
function parseViewportMountStrategy(strategy: string): ViewportMountStrategy | undefined {
  const separator = strategy.indexOf(':');
  const name = separator < 0 ? strategy : strategy.slice(0, separator);
  if (name !== 'visible' && name !== 'in-view') {
    return undefined;
  }
  const rootMargin = separator < 0 ? undefined : strategy.slice(separator + 1) || undefined;
  return { isReversible: name === 'in-view', rootMargin };
}

/** Keep an invalid strategy inert while exposing the exact failure. */
function rejectMountStrategy(_strategy: string, error: unknown): AppliedMountStrategy {
  return { valid: false, dispose() {}, error };
}

/**
 * Start applying a strategy to one element, returning its teardown and any
 * eager work which a DOM settlement boundary must await.
 *
 * Strategies never construct anything themselves: they only decide *when*
 * to call the hooks the registry passes in, so a single canonical
 * constructor stays registered per component name (issue #751).
 */
export function applyMountStrategy(
  el: HTMLElement,
  strategy: string,
  { mount, destroy }: MountStrategyHooks,
): AppliedMountStrategy {
  const viewport = parseViewportMountStrategy(strategy);
  if (viewport) {
    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (!viewport.isReversible) {
                observer.disconnect();
              }
              mount();
            } else if (viewport.isReversible) {
              destroy();
            }
          }
        },
        viewport.rootMargin ? { rootMargin: viewport.rootMargin } : undefined,
      );
    } catch (error) {
      // The browser owns the rootMargin grammar. Report author errors without
      // changing the requested mount policy or stopping registry reconciliation.
      return rejectMountStrategy(strategy, error);
    }
    observer.observe(el);
    return { valid: true, dispose: () => observer.disconnect() };
  }

  if (strategy === 'idle') {
    // `requestIdleCallback` is not available everywhere; the background
    // lane is already budgeted, so it is a fair fallback.
    if (typeof requestIdleCallback !== 'function') {
      const task = defaultScheduler.background(mount);
      return { valid: true, dispose: () => task.cancel() };
    }
    const handle = requestIdleCallback(() => mount());
    return { valid: true, dispose: () => cancelIdleCallback(handle) };
  }

  if (strategy === 'interaction') {
    const onIntent = () => {
      teardown();
      mount();
    };
    const teardown = () => {
      for (const type of INTENT_EVENTS) {
        el.removeEventListener(type, onIntent);
      }
    };
    for (const type of INTENT_EVENTS) {
      el.addEventListener(type, onIntent, { once: true });
    }
    return { valid: true, dispose: teardown };
  }

  if (strategy.startsWith('media:')) {
    const source = strategy.slice('media:'.length);
    if (source.trim().length === 0) {
      return rejectMountStrategy(
        strategy,
        new TypeError('The media mount strategy requires a non-empty query.'),
      );
    }
    const query = matchMedia(source);
    const sync = () => (query.matches ? mount() : destroy());
    query.addEventListener('change', sync);
    sync();
    return {
      valid: true,
      dispose: () => query.removeEventListener('change', sync),
    };
  }

  if (strategy !== 'eager') {
    return rejectMountStrategy(strategy, new TypeError(`Unknown mount strategy "${strategy}".`));
  }

  const task = defaultScheduler.background(mount);
  return { valid: true, dispose: () => task.cancel(), eagerWork: task.promise };
}
