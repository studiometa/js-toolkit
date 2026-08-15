import { reportDiagnostic, warnOnce } from './diagnostics.js';
import { EVENTS } from './events.js';

/**
 * Negotiated events — a step announced before it happens, which anything up
 * the tree may take part in.
 *
 * The DOM is the component tree, so the announcement is a bubbling event and
 * taking part is a synchronous answer to it. Nothing is registered in advance,
 * nothing is declared, and the emitter never learns who answered — or whether
 * anybody did.
 *
 * There are exactly two things a listener can ask for, and they are the two
 * modes of this one mechanism:
 *
 * | mode          | asks for       | registers with | keeps                  |
 * | ------------- | -------------- | -------------- | ---------------------- |
 * | **take over** | the action     | `wrap()`       | one runner, last wins  |
 * | **delay**     | the moment     | `waitUntil()`  | many, all awaited      |
 *
 * `domUpdate()` is the first: code about to mutate the DOM lets an ancestor run
 * the mutation inside a transition of its own. `emitExtendable()` is the second:
 * code running a choreography lets anything above it hold a step open until its
 * own work has settled. `@studiometa/ui` grew both
 * independently — `utils/dom-update.ts` and `Dialog.__emitExtendable` — with
 * near-identical windows, warnings and duck typing; this is that mechanism,
 * once.
 *
 * Two properties are enforced here rather than left to the listener, and they
 * are what make announcing a step safe:
 *
 * 1. A registration is only valid **while the event dispatches**. A listener
 *    that keeps the function and calls it later is warned and ignored, because
 *    by then the step has already happened.
 * 2. **The emitter's work always completes.** A registration that throws or
 *    rejects is reported, never rethrown: a take-over applies the mutation
 *    anyway, exactly once, and a delayed step goes ahead.
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
  accept(registration: R): void;
}

/**
 * Emit a negotiable event and collect what the listeners registered.
 *
 * The whole difference between the two modes is what `accept` does with a
 * registration — overwrite the single one, or push onto the list. Everything
 * else, transport and window included, is shared.
 */
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

/**
 * Call a registration, whichever of the accepted shapes it is: a function, or
 * a duck-typed object exposing the method that names the event for it —
 * `update()` for a DOM change, `open()`/`close()` for a dialog's steps.
 *
 * Anything else is handed back untouched, which is how a bare thenable reaches
 * `waitUntil()` with nothing to call.
 */
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

/**
 * A component able to run a DOM change inside its own transition — the
 * duck-typed half of the take-over mode. `MotionView` from
 * `@studiometa/ui-motion` is one; any object exposing `update(mutate)` works,
 * which is why nothing here imports a class.
 */
export interface DomUpdateTransitioner {
  update(mutate: DomMutation): void | Promise<unknown>;
}

/**
 * What `wrap()` accepts: a function receiving the `apply` callback, or a
 * transitioner whose `update()` receives it.
 *
 * The function form is what makes the core runners usable as they are —
 * `wrap(viewTransition)` type-checks, because `viewTransition(update)` already
 * takes a mutation and hands back a promise.
 */
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

/**
 * A transitioner extending a choreography: an object exposing a method named
 * after the step, called with no arguments — `waitUntil(motionView)` on an
 * `open` event calls `motionView.open()`.
 */
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
 * Take-over mode — announce a DOM change, and apply it.
 *
 * Nobody claiming is the common case and stays **synchronous**: the mutation
 * runs before the returned promise exists, so a reactive pipeline can read the
 * DOM back on the next line. A claim makes it asynchronous, and the promise
 * resolves once the change has been applied either way.
 *
 * The target is a DOM node because DOM ancestry gives the bubbling event its
 * scope. The helper does not require a component instance.
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
    // One runner, and the last claim wins. Bubbling visits the nearest
    // ancestor first, and the nearest one is not necessarily the one that
    // should animate: an outer listener owning the whole region takes over
    // deliberately.
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
 * Delay mode — announce a step, and wait for everything that asked to hold it.
 *
 * The name is the platform's: `ExtendableEvent.waitUntil()` in the service
 * worker spec is this contract exactly — many registrations, all awaited, the
 * host doing the waiting. A listener needs nothing explained to it.
 *
 * Every registration is awaited and **no rejection propagates**: a failing
 * extension must never leave the emitter's choreography half-done — a dialog
 * still painted, the scroll still locked. Failures are reported instead.
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
    // Many registrations, all of them awaited: extending a step is not
    // exclusive, and two components animating out both need to be waited for.
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
