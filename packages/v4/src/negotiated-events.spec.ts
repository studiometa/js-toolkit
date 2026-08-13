import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, SOURCE, type DelegatedEvent } from './Base.js';
import {
  DOM_UPDATE_EVENT,
  type DomUpdateDetail,
  type DomUpdateRunner,
  type ExtendableDetail,
} from './negotiated-events.js';
import { defaultScheduler, nextFrame } from './scheduler.js';
import { resetDom } from './test-utils.js';
import { viewTransition } from './viewTransition.js';

afterEach(resetDom);

/**
 * Collect what `reportError()` sends through the platform's error channel
 * while an async body runs. The listener is removed in a `finally`, so a
 * rejected wait cannot leak it into the rest of the run.
 */
async function catchReportedErrors(run: () => Promise<void>): Promise<unknown[]> {
  const reported: unknown[] = [];
  const onError = (event: ErrorEvent) => {
    reported.push(event.error);
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  window.addEventListener('error', onError, { capture: true });
  try {
    await run();
  } finally {
    window.removeEventListener('error', onError, { capture: true });
  }
  return reported;
}

class Mutator extends Base {
  static config = { name: 'Mutator' };
}

/**
 * An ancestor claiming through the delegated form instead of a raw listener:
 * the payload a plain listener reads as `event.detail` arrives as the single
 * argument, because a non-array detail is one payload rather than a list.
 */
class Watcher extends Base {
  static config = { name: 'Watcher', components: { Mutator } };

  seen: unknown[][] = [];

  onMutatorDomUpdate({ args, event }: DelegatedEvent<Mutator>) {
    this.seen.push(args);
    // The very same object, from both directions.
    expect(args[0]).toBe((event as CustomEvent).detail);
    (args[0] as DomUpdateDetail).wrap(async (apply) => {
      await apply();
    });
  }
}

/**
 * `<div id="outer"><div id="inner"><p data-component="Mutator"></p></div></div>`
 * plus a sibling nobody announces through, all in the document so the
 * announcement travels a real event path.
 */
function render() {
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  const el = document.createElement('p');
  el.setAttribute('data-component', 'Mutator');
  const sibling = document.createElement('div');
  inner.append(el);
  outer.append(inner);
  document.body.append(outer, sibling);
  return { outer, inner, sibling, instance: new Mutator(el).$mount() };
}

/**
 * Read the negotiation payload. It is the detail itself, not its first
 * element: a negotiated event carries one object, so plain JavaScript on the
 * page reads `event.detail.wrap(…)`.
 */
function payloadOf<T>(event: Event): T {
  return (event as CustomEvent).detail as T;
}

/** Take over every announced change from `el`, with `runner`. */
function claimFrom(el: Element, runner: DomUpdateRunner): void {
  el.addEventListener(DOM_UPDATE_EVENT, (event) => payloadOf<DomUpdateDetail>(event).wrap(runner));
}

/** Hold every announced `event` from `el` open, with `extension`. */
function extendFrom(
  el: Element,
  event: string,
  extension: Parameters<ExtendableDetail['waitUntil']>[0],
): void {
  el.addEventListener(event, (dispatched) =>
    payloadOf<ExtendableDetail>(dispatched).waitUntil(extension),
  );
}

describe('$domUpdate — the take-over mode', () => {
  it('applies the change directly, and synchronously, when nobody claims it', async () => {
    const { instance } = render();

    const promise = instance.$domUpdate(() => {
      instance.$el.textContent = 'applied';
    });

    // Before the first `await`: an unclaimed change must not turn a reactive
    // pipeline asynchronous, so the DOM is readable back on the next line.
    expect(instance.$el.textContent).toBe('applied');
    await expect(promise).resolves.toBeUndefined();
  });

  it('runs the change through the runner an ancestor claimed it with', async () => {
    const { outer, instance } = render();
    const order: string[] = [];

    claimFrom(outer, async (apply) => {
      order.push('runner:start');
      await Promise.resolve();
      await apply();
      order.push('runner:end');
    });

    const promise = instance.$domUpdate(() => {
      order.push('apply');
      instance.$el.textContent = 'wrapped';
    });

    // The runner deferred it, so nothing has happened yet.
    expect(instance.$el.textContent).toBe('');
    await promise;
    expect(instance.$el.textContent).toBe('wrapped');
    expect(order).toEqual(['runner:start', 'apply', 'runner:end']);
  });

  it('accepts a transitioner and runs the change through its update()', async () => {
    const { outer, instance } = render();
    // The duck type `MotionView` satisfies: an object with `update(mutate)`,
    // never a class this package knows about.
    const transitioner = {
      calls: 0,
      async update(mutate: () => void | Promise<void>) {
        this.calls += 1;
        await mutate();
      },
    };

    claimFrom(outer, transitioner);
    await instance.$domUpdate(() => {
      instance.$el.textContent = 'animated';
    });

    expect(transitioner.calls).toBe(1);
    expect(instance.$el.textContent).toBe('animated');
  });

  it('applies the change anyway and reports the failure when the runner rejects', async () => {
    const { outer, instance } = render();
    const error = new Error('runner boom');

    claimFrom(outer, () => Promise.reject(error));

    const reported = await catchReportedErrors(async () => {
      // Never rethrown: the caller asked for a DOM change, and it happened.
      await expect(
        instance.$domUpdate(() => {
          instance.$el.textContent = 'applied anyway';
        }),
      ).resolves.toBeUndefined();
    });

    expect(instance.$el.textContent).toBe('applied anyway');
    expect(reported).toEqual([error]);
  });

  it('applies the change anyway when the runner settles without applying it', async () => {
    const { outer, instance } = render();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      // Resolves happily and forgets the change — the failure mode that stays
      // silent unless the protocol guarantees the mutation itself.
      claimFrom(outer, () => Promise.resolve());
      await instance.$domUpdate(() => {
        instance.$el.textContent = 'applied anyway';
      });

      expect(instance.$el.textContent).toBe('applied anyway');
      expect(warn).toHaveBeenCalledWith(
        '[base] The `dom-update` runner settled without applying the change, applying it directly.',
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('applies the change exactly once, whatever the runner does', async () => {
    const { outer, instance } = render();
    let calls = 0;

    claimFrom(outer, async (apply) => {
      await apply();
      await apply();
    });
    await instance.$domUpdate(() => {
      calls += 1;
    });

    expect(calls).toBe(1);
  });

  it('warns and ignores a wrap() call made after the event dispatched', async () => {
    const { outer, instance } = render();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let late: DomUpdateDetail['wrap'] | undefined;
    let runnerCalls = 0;

    try {
      outer.addEventListener(DOM_UPDATE_EVENT, (event) => {
        // Kept for later instead of answering now — the mistake the protocol
        // refuses, because the change may already have run.
        late = payloadOf<DomUpdateDetail>(event).wrap;
      });

      await instance.$domUpdate(() => {
        instance.$el.textContent = 'applied';
      });
      expect(instance.$el.textContent).toBe('applied');

      late?.(() => {
        runnerCalls += 1;
      });

      expect(runnerCalls).toBe(0);
      expect(warn).toHaveBeenCalledWith(
        '[base] `wrap()` must be called synchronously while the `dom-update` event dispatches.',
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('lets the last claimant win when two ancestors claim the change', async () => {
    const { outer, inner, instance } = render();
    const seen: string[] = [];

    // `inner` is nearer, so bubbling reaches it first and `outer` overrides it.
    claimFrom(inner, async (apply) => {
      seen.push('inner');
      await apply();
    });
    claimFrom(outer, async (apply) => {
      seen.push('outer');
      await apply();
    });

    await instance.$domUpdate(() => {
      seen.push('apply');
    });

    expect(seen).toEqual(['outer', 'apply']);
  });

  it('is not visible to a listener outside the ancestor chain', async () => {
    const { sibling, instance } = render();
    let seen = 0;

    // Ancestry is the whole scoping rule: a component elsewhere in the page
    // hears nothing, with no filtering to write.
    sibling.addEventListener(DOM_UPDATE_EVENT, () => {
      seen += 1;
    });
    document.addEventListener(DOM_UPDATE_EVENT, () => {
      seen += 1;
    });

    await instance.$domUpdate(() => {
      instance.$el.textContent = 'applied';
    });

    // The document is an ancestor and does hear it; the sibling does not.
    expect(seen).toBe(1);
    expect(instance.$el.textContent).toBe('applied');
  });

  it('composes with viewTransition() as the claimed runner', async () => {
    const { outer, instance } = render();
    expect(typeof document.startViewTransition).toBe('function');

    // `viewTransition` is already a runner: it takes the mutation and hands
    // back a promise, so claiming with it needs no adapter.
    claimFrom(outer, viewTransition);
    await instance.$domUpdate(() => {
      instance.$el.textContent = 'transitioned';
    });

    expect(instance.$el.textContent).toBe('transitioned');
    await nextFrame();
  });

  it("composes with the scheduler's write phase as the claimed runner", async () => {
    const { outer, instance } = render();
    let phase = '';

    claimFrom(outer, (apply) => defaultScheduler.write(apply).promise);
    const promise = instance.$domUpdate(() => {
      phase = 'write';
      instance.$el.textContent = 'batched';
    });

    // Deferred to the frame's write phase rather than run in the event handler.
    expect(phase).toBe('');
    await promise;
    expect(phase).toBe('write');
    expect(instance.$el.textContent).toBe('batched');
  });

  it('carries one object as the detail, annotated with its source', async () => {
    const { outer, instance } = render();
    let seen: CustomEvent | undefined;

    outer.addEventListener(DOM_UPDATE_EVENT, (event) => {
      seen = event as CustomEvent;
    });
    await instance.$domUpdate(() => {});

    // What plain JavaScript on the page reads. Not `detail[0].wrap`: the
    // payload is a registration function, not a list of emitted arguments.
    expect(typeof seen?.detail.wrap).toBe('function');
    expect(Array.isArray(seen?.detail)).toBe(false);
    // Everything `$emit` would have given it, all the same.
    expect(seen?.bubbles).toBe(true);
    expect(seen?.cancelable).toBe(true);
    expect((seen as unknown as Record<symbol, unknown>)[SOURCE]).toBe(instance);
  });

  it('reaches a delegated on<Child>DomUpdate() handler, payload included', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'Watcher');
    const el = document.createElement('p');
    el.setAttribute('data-component', 'Mutator');
    root.append(el);
    document.body.append(root);

    const watcher = new Watcher(root).$mount();
    const instance = new Mutator(el).$mount();

    await instance.$domUpdate(() => {
      el.textContent = 'delegated';
    });

    // Delegation binds by event type on the root element and walks up from
    // `event.target`, so it never sees how the event was built.
    expect(watcher.seen).toHaveLength(1);
    expect(typeof (watcher.seen[0][0] as DomUpdateDetail).wrap).toBe('function');
    expect(el.textContent).toBe('delegated');
  });
});

describe('$emitExtendable — the delay mode', () => {
  it('resolves without waiting when nobody extends the step', async () => {
    const { instance } = render();
    const seen: string[] = [];

    document.addEventListener('close', () => seen.push('heard'));
    await instance.$emitExtendable('close');

    expect(seen).toEqual(['heard']);
  });

  it('waits for every registration, not only the last one', async () => {
    const { outer, inner, instance } = render();
    const settled: string[] = [];
    const hold = (name: string, ms: number) =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          settled.push(name);
          resolve();
        }, ms),
      );

    // This is where the two modes genuinely differ: extending a step is not
    // exclusive, so two components animating out are both waited for.
    extendFrom(inner, 'close', hold('inner', 30));
    extendFrom(outer, 'close', hold('outer', 5));

    await instance.$emitExtendable('close');

    expect(settled).toHaveLength(2);
    expect(new Set(settled)).toEqual(new Set(['inner', 'outer']));
  });

  it('accepts a thenable, a function, or a transitioner named after the step', async () => {
    const { outer, inner, instance } = render();
    const seen: string[] = [];

    extendFrom(
      inner,
      'close',
      Promise.resolve().then(() => void seen.push('thenable')),
    );
    extendFrom(inner, 'close', () => {
      seen.push('function');
    });
    // Duck-typed by convention: the method is the one that names the step, so
    // nothing has to be configured and no name is passed as an option.
    extendFrom(outer, 'close', {
      close() {
        seen.push('transitioner');
      },
    });

    await instance.$emitExtendable('close');

    expect(new Set(seen)).toEqual(new Set(['thenable', 'function', 'transitioner']));
  });

  it('completes the choreography and reports the failure when an extension rejects', async () => {
    const { outer, inner, instance } = render();
    const error = new Error('extension boom');
    let completed = false;

    extendFrom(inner, 'close', Promise.reject(error));
    extendFrom(outer, 'close', () => Promise.resolve());

    const reported = await catchReportedErrors(async () => {
      // Never rethrown: a failing extension must not leave the dialog painted
      // and the scroll locked.
      await expect(instance.$emitExtendable('close')).resolves.toBeUndefined();
      completed = true;
    });

    expect(completed).toBe(true);
    expect(reported).toEqual([error]);
  });

  it('warns and ignores a waitUntil() call made after the event dispatched', async () => {
    const { outer, instance } = render();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let late: ExtendableDetail['waitUntil'] | undefined;
    let extensionCalls = 0;

    try {
      outer.addEventListener('close', (event) => {
        late = payloadOf<ExtendableDetail>(event).waitUntil;
      });

      await instance.$emitExtendable('close');

      late?.(() => {
        extensionCalls += 1;
      });

      expect(extensionCalls).toBe(0);
      // The same window, the same wording, derived from the mode's key and the
      // step's name: one mechanism, two registration functions.
      expect(warn).toHaveBeenCalledWith(
        '[base] `waitUntil()` must be called synchronously while the `close` event dispatches.',
      );
    } finally {
      warn.mockRestore();
    }
  });

  it('carries the emitter context to its listeners', async () => {
    const { outer, instance } = render();
    const seen: unknown[] = [];

    outer.addEventListener('close', (event) => {
      const detail = payloadOf<ExtendableDetail & { reason?: string }>(event);
      seen.push(detail.reason);
      expect(typeof detail.waitUntil).toBe('function');
    });

    await instance.$emitExtendable('close', { reason: 'escape' });

    expect(seen).toEqual(['escape']);
  });
});
