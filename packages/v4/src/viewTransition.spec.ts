import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultScheduler, nextFrame } from './scheduler.js';
import { resetDom } from './test-utils.js';
import { viewTransition, type ViewTransitionUpdate } from './viewTransition.js';

let restoreStartViewTransition = () => {};

afterEach(async () => {
  restoreStartViewTransition();
  restoreStartViewTransition = () => {};
  vi.restoreAllMocks();
  await resetDom();
});

function mockStartViewTransition(
  start: ((update: ViewTransitionUpdate) => { finished: Promise<void> }) | undefined,
): void {
  restoreStartViewTransition();
  const descriptor = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: start,
  });
  restoreStartViewTransition = () => {
    if (descriptor) {
      Object.defineProperty(document, 'startViewTransition', descriptor);
    } else {
      delete (document as { startViewTransition?: unknown }).startViewTransition;
    }
  };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

async function waitForBatch(started: number[], length: number): Promise<void> {
  for (let index = 0; index < 50 && started.length < length; index += 1) {
    await Promise.resolve();
  }
  expect(started).toHaveLength(length);
}

describe('viewTransition()', () => {
  it('batches one flush and starts it after earlier scheduler writes', async () => {
    const order: string[] = [];
    const start = vi.fn((update: ViewTransitionUpdate) => ({
      finished: Promise.resolve().then(update),
    }));
    mockStartViewTransition(start);

    const write = defaultScheduler.write(() => order.push('write')).promise;
    const first = viewTransition(() => {
      order.push('first');
    });
    const second = viewTransition(() => {
      order.push('second');
    });

    await Promise.all([write, first, second]);
    expect(start).toHaveBeenCalledOnce();
    expect(order).toEqual(['write', 'first', 'second']);
  });

  it('serializes multiple later native batches after a successful transition', async () => {
    const finishes: ReturnType<typeof deferred>[] = [];
    const started: number[] = [];
    mockStartViewTransition((update) => {
      const finish = deferred();
      finishes.push(finish);
      const index = finishes.length;
      started.push(index);
      return {
        finished: Promise.resolve()
          .then(update)
          .then(() => finish.promise),
      };
    });

    const first = viewTransition(() => {});
    await nextFrame();
    const second = viewTransition(() => {});
    await nextFrame();
    const third = viewTransition(() => {});
    await nextFrame();
    expect(started).toEqual([1]);

    finishes[0].resolve();
    await waitForBatch(started, 2);
    expect(started).toEqual([1, 2]);

    finishes[1].resolve();
    await waitForBatch(started, 3);
    expect(started).toEqual([1, 2, 3]);

    finishes[2].resolve();
    await Promise.all([first, second, third]);
  });

  it('serializes overlapping batches in the unsupported fallback', async () => {
    mockStartViewTransition(undefined);
    const firstGate = deferred();
    const secondGate = deferred();
    const started: number[] = [];

    const first = viewTransition(async () => {
      started.push(1);
      await firstGate.promise;
    });
    await nextFrame();
    const second = viewTransition(async () => {
      started.push(2);
      await secondGate.promise;
    });
    await nextFrame();
    const third = viewTransition(() => {
      started.push(3);
    });
    await nextFrame();
    await waitForBatch(started, 1);
    expect(started).toEqual([1]);

    firstGate.resolve();
    await waitForBatch(started, 2);
    expect(started).toEqual([1, 2]);

    secondGate.resolve();
    await Promise.all([first, second, third]);
    expect(started).toEqual([1, 2, 3]);
  });

  it('keeps later batches serialized after an update rejects', async () => {
    const firstGate = deferred();
    const secondGate = deferred();
    const error = new Error('update failed');
    const started: number[] = [];
    mockStartViewTransition((update) => ({ finished: Promise.resolve().then(update) }));

    const first = viewTransition(async () => {
      started.push(1);
      await firstGate.promise;
      throw error;
    });
    const firstResult = first.then(
      () => expect.fail('The rejected update resolved.'),
      (reason) => expect(reason).toBe(error),
    );
    await nextFrame();
    const second = viewTransition(async () => {
      started.push(2);
      await secondGate.promise;
    });
    await nextFrame();
    const third = viewTransition(() => {
      started.push(3);
    });
    await nextFrame();
    await waitForBatch(started, 1);
    expect(started).toEqual([1]);

    firstGate.resolve();
    await firstResult;
    await waitForBatch(started, 2);
    expect(started).toEqual([1, 2]);

    secondGate.resolve();
    await Promise.all([second, third]);
    expect(started).toEqual([1, 2, 3]);
  });

  it('keeps later batches serialized after transition.finished rejects', async () => {
    const finishes: ReturnType<typeof deferred>[] = [];
    const error = new Error('finished failed');
    const started: number[] = [];
    mockStartViewTransition((update) => {
      const finish = deferred();
      finishes.push(finish);
      const index = finishes.length;
      started.push(index);
      return {
        finished: Promise.resolve()
          .then(update)
          .then(() => finish.promise),
      };
    });

    const first = viewTransition(() => {});
    const firstResult = first.then(
      () => expect.fail('The rejected transition resolved.'),
      (reason) => expect(reason).toBe(error),
    );
    await nextFrame();
    const second = viewTransition(() => {});
    await nextFrame();
    const third = viewTransition(() => {});
    await nextFrame();
    await waitForBatch(started, 1);
    expect(started).toEqual([1]);

    finishes[0].reject(error);
    await firstResult;
    await waitForBatch(started, 2);
    expect(started).toEqual([1, 2]);

    finishes[1].resolve();
    await waitForBatch(started, 3);
    expect(started).toEqual([1, 2, 3]);

    finishes[2].resolve();
    await Promise.all([second, third]);
  });
});
