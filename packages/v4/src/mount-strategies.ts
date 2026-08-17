import { defaultScheduler } from './scheduler.js';

/**
 * Control when an instance mounts.
 * `in-view` and `media` are reversible; all other strategies mount once.
 * Viewport suffixes are passed as `IntersectionObserverInit.rootMargin`.
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
 * Events that mount before the related interaction completes.
 * `pointerenter` also fires when an element appears under a resting cursor.
 */
const INTENT_EVENTS = ['pointerenter', 'pointerdown', 'focusin'] as const;

export interface MountStrategyHooks {
  mount: () => void;
  destroy: () => void;
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

type ParsedMountStrategy =
  | { kind: 'eager' }
  | { kind: 'idle' }
  | { kind: 'interaction' }
  | { kind: 'media'; query: string }
  | { kind: 'viewport'; reversible: boolean; rootMargin?: string }
  | { kind: 'invalid'; error: unknown };

/**
 * Read the strategy grammar once, for every question asked about it.
 *
 * Applying a strategy and describing one are the same switch: a seventh
 * strategy is taught to the framework here, and both the observer it installs
 * and the facts the registry schedules against follow from that single branch.
 */
function parseMountStrategy(strategy: string): ParsedMountStrategy {
  const separator = strategy.indexOf(':');
  const name = separator < 0 ? strategy : strategy.slice(0, separator);
  const parameter = separator < 0 ? '' : strategy.slice(separator + 1);

  if (name === 'visible' || name === 'in-view') {
    return { kind: 'viewport', reversible: name === 'in-view', rootMargin: parameter || undefined };
  }
  if (name === 'media' && separator >= 0) {
    return parameter.trim().length === 0
      ? {
          kind: 'invalid',
          error: new TypeError('The media mount strategy requires a non-empty query.'),
        }
      : { kind: 'media', query: parameter };
  }
  if (strategy === 'eager' || strategy === 'idle' || strategy === 'interaction') {
    return { kind: strategy };
  }
  return { kind: 'invalid', error: new TypeError(`Unknown mount strategy "${strategy}".`) };
}

/** What a strategy does, known before it is applied to anything. */
export interface MountStrategyBehaviour {
  /** Mounts as soon as it is applied: there is no condition to wait for. */
  readonly eager: boolean;
  /** Unmounts again when its condition stops holding, and can fire more than once. */
  readonly reversible: boolean;
}

/**
 * Describe a strategy without installing it.
 *
 * The registry needs both facts *before* `applyMountStrategy()` returns,
 * because `media:` reads its query synchronously and can therefore call a hook
 * from inside that call. Deriving them from the parse above is what keeps the
 * list of reversible strategies in the module that owns the grammar.
 */
export function mountStrategyBehaviour(strategy: string): MountStrategyBehaviour {
  const parsed = parseMountStrategy(strategy);
  return {
    eager: parsed.kind === 'eager',
    reversible: parsed.kind === 'media' || (parsed.kind === 'viewport' && parsed.reversible),
  };
}

/** Keep an invalid strategy inert while exposing the exact failure. */
function rejectMountStrategy(error: unknown): AppliedMountStrategy {
  return { valid: false, dispose() {}, error };
}

/**
 * Apply a strategy and return its teardown and any eager work that DOM settlement must await.
 */
export function applyMountStrategy(
  el: HTMLElement,
  strategy: string,
  { mount, destroy }: MountStrategyHooks,
): AppliedMountStrategy {
  const parsed = parseMountStrategy(strategy);

  if (parsed.kind === 'invalid') {
    return rejectMountStrategy(parsed.error);
  }

  if (parsed.kind === 'viewport') {
    let observer: IntersectionObserver;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (!parsed.reversible) {
                observer.disconnect();
              }
              mount();
            } else if (parsed.reversible) {
              destroy();
            }
          }
        },
        parsed.rootMargin ? { rootMargin: parsed.rootMargin } : undefined,
      );
    } catch (error) {
      // The browser owns the rootMargin grammar. Report author errors without
      // changing the requested mount policy or stopping registry reconciliation.
      return rejectMountStrategy(error);
    }
    observer.observe(el);
    return { valid: true, dispose: () => observer.disconnect() };
  }

  if (parsed.kind === 'idle') {
    // `requestIdleCallback` is not available everywhere; the background
    // lane is already budgeted, so it is a fair fallback.
    if (typeof requestIdleCallback !== 'function') {
      const task = defaultScheduler.background(mount);
      return { valid: true, dispose: () => task.cancel() };
    }
    const handle = requestIdleCallback(() => mount());
    return { valid: true, dispose: () => cancelIdleCallback(handle) };
  }

  if (parsed.kind === 'interaction') {
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

  if (parsed.kind === 'media') {
    const query = matchMedia(parsed.query);
    const sync = () => (query.matches ? mount() : destroy());
    query.addEventListener('change', sync);
    // The first evaluation is not deferred: a matching query mounts before
    // this call returns, so a caller cannot assume it holds the teardown
    // below by the time its hooks run.
    sync();
    return {
      valid: true,
      dispose: () => query.removeEventListener('change', sync),
    };
  }

  const task = defaultScheduler.background(mount);
  return { valid: true, dispose: () => task.cancel(), eagerWork: task.promise };
}
