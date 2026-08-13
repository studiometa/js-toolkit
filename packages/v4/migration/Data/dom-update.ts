/**
 * The `dom-update` protocol — ported from `@studiometa/ui`
 * `utils/dom-update.ts`.
 *
 * `data-bind:if` inserts and removes DOM. Before it does, it announces the
 * change with a bubbling event carrying `detail.wrap(runner)`, so a listener
 * — a view transition, an exit animation — can take over *when* the change
 * runs without owning *what* it is.
 *
 * Two things survived the port and one changed:
 *
 * - the raw `dispatchEvent` stayed. ui bypasses `$emit` because `Fetch`
 *   overrides it with a string-only signature; v4's `$emit` is fine on that
 *   count but still wrong here, because it packs its arguments into
 *   `detail` **as an array** (`detail: args`). This protocol needs an object
 *   `detail` with a `wrap` method on it, which `$emit` cannot express.
 *   *Ask for core:* a way to emit a payload object, or an explicit statement
 *   that protocol events are raw `CustomEvent`s and `$emit` is for component
 *   events only.
 * - `instance.$warn(...)` became a plain `warn()`, since v4 has no `$warn`
 *   (REPORT.md gap 10).
 */

/**
 * A component able to run a DOM change inside its own transition — the
 * duck-typed handshake. Any object exposing `update(mutate)` works.
 */
export interface DomUpdateTransitioner {
  update(mutate: () => void | Promise<void>): void | Promise<unknown>;
}

export type DomUpdateRunner =
  | ((apply: () => void) => void | Promise<unknown>)
  | DomUpdateTransitioner;

export type NormalizedRunner = (apply: () => void) => void | Promise<unknown>;

export function warn(...args: unknown[]): void {
  console.warn('[data]', ...args);
}

/**
 * Announce an imminent DOM change and return the runner a listener
 * registered, normalized to a function — or `null` when nobody wrapped.
 *
 * `wrap()` only accepts registrations synchronously while the event
 * dispatches; the last call wins.
 */
export function emitDomUpdate(
  el: HTMLElement,
  detail: Record<string, unknown> = {},
): NormalizedRunner | null {
  let runner: DomUpdateRunner | null = null;
  let dispatching = true;

  function wrap(newRunner: DomUpdateRunner) {
    if (!dispatching) {
      warn('`wrap` must be called synchronously while the `dom-update` event dispatches.');
      return;
    }
    runner = newRunner;
  }

  el.dispatchEvent(new CustomEvent('dom-update', { detail: { ...detail, wrap }, bubbles: true }));
  dispatching = false;

  if (runner && typeof (runner as DomUpdateTransitioner).update === 'function') {
    const transitioner = runner as DomUpdateTransitioner;
    return (apply) => transitioner.update(apply);
  }

  return runner as NormalizedRunner | null;
}

/**
 * Run a DOM change through a registered runner without ever losing it: a
 * runner that throws or rejects gets the change applied anyway.
 */
export async function runWrapped(runner: NormalizedRunner, applyChange: () => void): Promise<void> {
  let applied = false;
  function apply() {
    applied = true;
    applyChange();
  }
  try {
    await runner(apply);
  } catch (error) {
    warn('The `dom-update` runner rejected.', error);
    if (!applied) {
      apply();
    }
  }
}
