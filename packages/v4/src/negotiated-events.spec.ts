import { afterEach, describe, expect, it, vi } from 'vitest';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import {
  domUpdate,
  emitExtendable,
  type DomUpdateDetail,
  type DomUpdateRunner,
  type ExtendableDetail,
  type Extension,
} from './negotiated-events.js';
import { nextFrame } from './scheduler.js';
import { resetDom } from './test-utils.js';
import { viewTransition } from './viewTransition.js';

afterEach(async () => {
  vi.restoreAllMocks();
  await resetDom();
});

async function catchDiagnostics(run: () => Promise<void>): Promise<ToolkitDiagnosticDetail[]> {
  const diagnostics: ToolkitDiagnosticDetail[] = [];
  const onDiagnostic = (event: Event) => {
    event.preventDefault();
    diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
  };
  document.addEventListener(EVENTS.diagnostic, onDiagnostic);
  try {
    await run();
  } finally {
    document.removeEventListener(EVENTS.diagnostic, onDiagnostic);
  }
  return diagnostics;
}

function renderTarget() {
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  const target = document.createElement('p');
  inner.append(target);
  outer.append(inner);
  document.body.append(outer);
  return { outer, inner, target };
}

function detailOf<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}

function claim(target: Node, runner: DomUpdateRunner): void {
  target.addEventListener(EVENTS.dom.update, (event) =>
    detailOf<DomUpdateDetail>(event).wrap(runner),
  );
}

function extend(target: Node, event: string, extension: Extension): void {
  target.addEventListener(event, (dispatched) =>
    detailOf<ExtendableDetail>(dispatched).waitUntil(extension),
  );
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('domUpdate()', () => {
  it('dispatches one bubbling, non-cancelable detail object and applies an unclaimed update synchronously', async () => {
    const { target } = renderTarget();
    let seen: CustomEvent | undefined;
    document.addEventListener(EVENTS.dom.update, (event) => {
      seen = event as CustomEvent;
    });

    const promise = domUpdate(
      target,
      () => {
        target.textContent = 'applied';
      },
      { reason: 'binding' },
    );

    expect(target.textContent).toBe('applied');
    expect(seen).toBeInstanceOf(CustomEvent);
    expect(seen).toMatchObject({ target, bubbles: true, cancelable: false });
    expect(seen?.detail).toMatchObject({ reason: 'binding', wrap: expect.any(Function) });
    expect(Array.isArray(seen?.detail)).toBe(false);
    await expect(promise).resolves.toBeUndefined();
  });

  it('runs the mutation through a claimed runner exactly once', async () => {
    const { outer, target } = renderTarget();
    const gate = deferred();
    const order: string[] = [];
    claim(outer, async (apply) => {
      order.push('runner:start');
      await gate.promise;
      await apply();
      await apply();
      order.push('runner:end');
    });

    const promise = domUpdate(target, () => {
      order.push('apply');
      target.textContent = 'wrapped';
    });

    expect(target.textContent).toBe('');
    gate.resolve();
    await promise;
    expect(target.textContent).toBe('wrapped');
    expect(order).toEqual(['runner:start', 'apply', 'runner:end']);
  });

  it('lets the last claimant win and accepts a duck-typed transitioner', async () => {
    const { outer, inner, target } = renderTarget();
    const seen: string[] = [];
    claim(inner, () => {
      seen.push('inner');
    });
    claim(outer, {
      async update(apply) {
        seen.push('outer');
        await apply();
      },
    });

    await domUpdate(target, () => {
      seen.push('apply');
    });

    expect(seen).toEqual(['outer', 'apply']);
  });

  it('reports a failing runner and still applies the mutation', async () => {
    const { outer, target } = renderTarget();
    const error = new Error('runner boom');
    claim(outer, () => Promise.reject(error));

    const diagnostics = await catchDiagnostics(async () => {
      await expect(
        domUpdate(target, () => target.setAttribute('data-applied', 'yes')),
      ).resolves.toBe(undefined);
    });

    expect(target.dataset.applied).toBe('yes');
    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.domUpdateRunnerFailed,
        message: `The \`${EVENTS.dom.update}\` runner failed.`,
        error,
      },
    ]);
  });

  it('keeps the direct fallback when its warning is canceled', async () => {
    const { outer, target } = renderTarget();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    target.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    });
    const runner = () => Promise.resolve();
    claim(outer, runner);

    await domUpdate(target, () => target.setAttribute('data-applied', 'yes'));
    await domUpdate(target, () => target.setAttribute('data-applied-again', 'yes'));

    expect(target.dataset).toMatchObject({ applied: 'yes', appliedAgain: 'yes' });
    expect(diagnostics.map(({ code }) => code)).toEqual([DIAGNOSTICS.protocol.unappliedDomUpdate]);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns and ignores a wrap() registration made after dispatch', async () => {
    const { outer, target } = renderTarget();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let late: DomUpdateDetail['wrap'] | undefined;
    outer.addEventListener(EVENTS.dom.update, (event) => {
      late = detailOf<DomUpdateDetail>(event).wrap;
    });

    await domUpdate(target, () => target.setAttribute('data-applied', 'yes'));
    late?.(() => target.setAttribute('data-late', 'yes'));
    await domUpdate(target, () => target.setAttribute('data-applied-again', 'yes'));
    late?.(() => target.setAttribute('data-later', 'yes'));

    expect(target.dataset).toMatchObject({ applied: 'yes', appliedAgain: 'yes' });
    expect(target.dataset.late).toBeUndefined();
    expect(target.dataset.later).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });

  it('accepts viewTransition() without an adapter', async () => {
    const { outer, target } = renderTarget();
    claim(outer, viewTransition);

    await domUpdate(target, () => target.setAttribute('data-applied', 'yes'));

    expect(target.dataset.applied).toBe('yes');
    await nextFrame();
  });
});

describe('emitExtendable()', () => {
  it('dispatches one bubbling, non-cancelable detail object', async () => {
    const { target } = renderTarget();
    let seen: CustomEvent | undefined;
    document.addEventListener('close', (event) => {
      seen = event as CustomEvent;
    });

    await emitExtendable(target, 'close', { reason: 'escape' });

    expect(seen).toBeInstanceOf(CustomEvent);
    expect(seen).toMatchObject({ target, bubbles: true, cancelable: false });
    expect(seen?.detail).toMatchObject({ reason: 'escape', waitUntil: expect.any(Function) });
    expect(Array.isArray(seen?.detail)).toBe(false);
  });

  it('accepts and awaits every thenable, function and duck-typed transitioner', async () => {
    const { outer, inner, target } = renderTarget();
    const first = deferred();
    const second = deferred();
    const seen: string[] = [];
    extend(
      inner,
      'close',
      first.promise.then(() => void seen.push('thenable')),
    );
    extend(inner, 'close', async () => {
      await second.promise;
      seen.push('function');
    });
    extend(outer, 'close', {
      close() {
        seen.push('transitioner');
      },
    });

    let settled = false;
    const promise = emitExtendable(target, 'close').then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(seen).toEqual(['transitioner']);
    expect(settled).toBe(false);

    first.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);
    second.resolve();
    await promise;
    expect(new Set(seen)).toEqual(new Set(['thenable', 'function', 'transitioner']));
  });

  it('reports extension failures without rejecting or skipping other registrations', async () => {
    const { outer, inner, target } = renderTarget();
    const error = new Error('extension boom');
    let completed = false;
    extend(inner, 'close', Promise.reject(error));
    extend(outer, 'close', () => {
      completed = true;
    });

    const diagnostics = await catchDiagnostics(async () => {
      await expect(emitExtendable(target, 'close')).resolves.toBeUndefined();
    });

    expect(completed).toBe(true);
    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.extendableEventExtensionFailed,
        message: 'An extension of the `close` event failed.',
        error,
      },
    ]);
  });

  it('warns and ignores a waitUntil() registration made after dispatch', async () => {
    const { outer, target } = renderTarget();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let late: ExtendableDetail['waitUntil'] | undefined;
    let calls = 0;
    outer.addEventListener('close', (event) => {
      late = detailOf<ExtendableDetail>(event).waitUntil;
    });

    await emitExtendable(target, 'close');
    late?.(() => {
      calls += 1;
    });
    late?.(() => {
      calls += 1;
    });

    expect(calls).toBe(0);
    expect(warn).toHaveBeenCalledOnce();
  });
});
