import { reportDiagnostic, warnOnce } from './diagnostics.js';
import { EVENTS } from './events.js';

/**
 * Negotiated event invariants:
 * registrations are synchronous, the last `wrap()` wins, and all `waitUntil()` calls are awaited.
 * Registration failures are reported without stopping the emitter's work.
 */

interface NegotiationOptions<R> {
  /** The DOM node the bubbling event starts from. */
  target: Node;
  /** The event's name, for dispatch, warnings and duck-typed method lookup. */
  event: string;
  /** The key the registration function is exposed under: `wrap`, `waitUntil`. */
  key: string;
  /** Extra context merged into the detail, alongside the registration function. */
  detail?: Record<string, unknown>;
  /** Called for each registration made while the event dispatches. */
  accept: (registration: R) => void;
}

/** Emit a bubbling event and collect synchronous registrations. */
function negotiate<R>({ target, event, key, detail, accept }: NegotiationOptions<R>): void {
  let isDispatching = true;
  const register = (registration: R) => {
    if (!isDispatching) {
      warnOnce(
        target,
        `${event}\0${key}`,
        'protocol.late-registration',
        `\`${key}()\` must be called synchronously while the \`${event}\` event dispatches.`,
        { target: diagnosticTarget(target) },
      );
      return;
    }
    accept(registration);
  };
  const payload = {
    ...detail,
    [key]: register,
  };

  target.dispatchEvent(
    new CustomEvent(event, { bubbles: true, cancelable: false, detail: payload }),
  );
  isDispatching = false;
}

/** Return the target element used for diagnostics. */
function diagnosticTarget(target: Node): Element | undefined {
  return target instanceof Element ? target : (target.parentElement ?? undefined);
}

function invoke(registration: unknown, method: string, args: unknown[]): unknown {
  if (typeof registration === 'function') {
    return (registration as (...rest: unknown[]) => unknown)(...args);
  }
  const fn = (registration as Record<string, unknown> | null | undefined)?.[method];
  if (typeof fn === 'function') {
    return (fn as (...rest: unknown[]) => unknown).apply(registration, args);
  }
  return registration;
}

/** The DOM change itself: whatever the announcing component was about to do. */
export type DomMutation = () => void | Promise<void>;

/** An object that can run a DOM change inside a transition. */
export interface DomUpdateTransitioner {
  update(mutate: DomMutation): void | Promise<unknown>;
}

/** A function or transitioner that receives the DOM mutation callback. */
export type DomUpdateRunner =
  | ((apply: DomMutation) => void | Promise<unknown>)
  | DomUpdateTransitioner;

/** The `EVENTS.dom.update` payload: `wrap()` plus emitter context. */
export interface DomUpdateDetail {
  /**
   * Take over the announced change. Valid synchronously only, and the last
   * call wins.
   */
  wrap(runner: DomUpdateRunner): void;
}

/** An object with a method whose name matches the announced event. */
export type ExtendableTransitioner = Record<string, unknown>;

/** What `waitUntil()` accepts: something to await, or something to call. */
export type Extension = PromiseLike<unknown> | (() => unknown) | ExtendableTransitioner;

/** The payload of an extendable event: `waitUntil()` plus the emitter's context. */
export interface ExtendableDetail {
  /**
   * Hold the announced step open until this settles. Valid synchronously only,
   * and every registration is awaited.
   */
  waitUntil(extension: Extension): void;
}

/**
 * Announce a DOM change and apply it exactly once.
 * The mutation runs synchronously when no listener claims it.
 */
export async function domUpdate(
  target: Node,
  mutate: DomMutation,
  detail?: Record<string, unknown>,
): Promise<void> {
  let runner: DomUpdateRunner | null = null;

  negotiate<DomUpdateRunner>({
    target,
    detail,
    event: EVENTS.dom.update,
    key: 'wrap',
    // Bubbling order makes the last claim win.
    accept: (registration) => {
      runner = registration;
    },
  });

  // Read through the declared type: the only assignment happens inside
  // `accept`, which control-flow analysis does not follow, so the narrowing
  // left by the initializer would claim `null` here.
  const claimed = runner as DomUpdateRunner | null;

  let isApplied = false;
  const apply: DomMutation = () => {
    // Exactly once, so a runner calling `apply()` twice cannot double-insert.
    if (isApplied) {
      return;
    }
    isApplied = true;
    return mutate();
  };

  if (!claimed) {
    return apply();
  }

  let hasFailed = false;
  try {
    await invoke(claimed, 'update', [apply]);
  } catch (error) {
    hasFailed = true;
    reportDiagnostic(
      'callback.dom-update-runner-failed',
      `The \`${EVENTS.dom.update}\` runner failed.`,
      error,
      { target: diagnosticTarget(target) },
    );
  }

  if (!isApplied) {
    if (!hasFailed) {
      warnOnce(
        claimed,
        '',
        'protocol.unapplied-dom-update',
        `The \`${EVENTS.dom.update}\` runner settled without applying the change; the change was applied directly.`,
        { target: diagnosticTarget(target) },
      );
    }
    await apply();
  }
}

/**
 * Announce a step and await all registered extensions.
 * Extension failures are reported and do not reject this function.
 */
export async function emitExtendable(
  target: Node,
  event: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  const pending: Promise<unknown>[] = [];

  negotiate<Extension>({
    target,
    detail,
    event,
    key: 'waitUntil',
    // Every registration is awaited.
    accept: (extension) => {
      pending.push(
        (async () => {
          try {
            await invoke(extension, event, []);
          } catch (error) {
            reportDiagnostic(
              'callback.extendable-event-extension-failed',
              `An extension of the \`${event}\` event failed.`,
              error,
              { target: diagnosticTarget(target) },
            );
          }
        })(),
      );
    },
  });

  await Promise.all(pending);
}
