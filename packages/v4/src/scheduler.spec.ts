import { describe, expect, it, vi } from 'vitest';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import { nextFrame, defaultScheduler, type SchedulerPhase, type TickProps } from './scheduler.js';

describe('defaultScheduler (real frames)', () => {
  it('runs reads before writes within one frame, regardless of scheduling order', async () => {
    const order: string[] = [];
    defaultScheduler.write(() => order.push('write'));
    defaultScheduler.read(() => order.push('read'));
    await defaultScheduler.whenIdle();
    expect(order).toEqual(['read', 'write']);
  });

  it('defers a read scheduled from a write to the next frame', async () => {
    const frames: number[] = [];
    let firstFrame = 0;
    defaultScheduler.write(() => {
      firstFrame = performance.now();
      defaultScheduler.read(() => frames.push(performance.now() - firstFrame));
    });
    await defaultScheduler.whenIdle();
    expect(frames).toHaveLength(1);
    expect(frames[0]).toBeGreaterThan(0);
  });

  it('survives a throwing task, reports it, and keeps its promise rejection', async () => {
    const failure = new Error('boom');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    document.addEventListener(
      EVENTS.diagnostic,
      (event) => {
        event.preventDefault();
        diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
      },
      { once: true },
    );

    const task = defaultScheduler.write(() => {
      throw failure;
    });
    await expect(task.promise).rejects.toBe(failure);

    const after = defaultScheduler.write(() => 'still alive');
    await expect(after.promise).resolves.toBe('still alive');
    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.scheduledTaskFailed,
        message: 'A scheduled task failed.',
        error: failure,
      },
    ]);
  });

  it('resolves task promises with return values and supports cancel', async () => {
    const canceled = defaultScheduler.read(() => 'never');
    canceled.cancel();
    const kept = defaultScheduler.read(() => 42);
    await expect(kept.promise).resolves.toBe(42);
    await expect(canceled.promise).resolves.toBeUndefined();
  });

  it('does not loop forever when a read schedules a read', async () => {
    let runs = 0;
    let isStopped = false;
    const tick = () => {
      runs += 1;
      if (!isStopped && runs < 100_000) defaultScheduler.read(tick);
    };
    defaultScheduler.read(tick);
    await new Promise((resolve) => setTimeout(resolve, 200));
    isStopped = true;
    expect(runs).toBeLessThan(100_000);
    await defaultScheduler.whenIdle();
  });

  it('still runs a write scheduled from a read in the same frame', async () => {
    const order: string[] = [];
    let readTime = 0;
    let writeTime = 0;
    defaultScheduler.read(() => {
      order.push('read');
      readTime = performance.now();
      defaultScheduler.write(() => {
        order.push('write');
        writeTime = performance.now();
      });
    });
    await defaultScheduler.whenIdle();
    expect(order).toEqual(['read', 'write']);
    expect(writeTime - readTime).toBeLessThan(8);
  });
});

describe('defaultScheduler.background', () => {
  it('still drains background work while every frame is busy', async () => {
    let background = 0;
    const off = defaultScheduler.tick(() => {
      const until = performance.now() + 10;
      while (performance.now() < until) {}
    });
    for (let i = 0; i < 5; i += 1) defaultScheduler.background(() => (background += 1));
    await new Promise((resolve) => setTimeout(resolve, 400));
    off();
    expect(background).toBe(5);
  });

  it('runs between frames, not inside one', async () => {
    const phases: SchedulerPhase[] = [];
    let inFrame = false;
    const off = defaultScheduler.tick(() => {
      inFrame = true;
      queueMicrotask(() => {
        inFrame = false;
      });
    });
    const seen: boolean[] = [];
    for (let i = 0; i < 3; i += 1) {
      defaultScheduler.background(() => {
        phases.push(defaultScheduler.phase);
        seen.push(inFrame);
      });
    }
    await defaultScheduler.whenIdle();
    off();

    expect(phases).toEqual(['background', 'background', 'background']);
    expect(seen).toEqual([false, false, false]);
  });

  it('yields between turns instead of draining in one go', async () => {
    let hasYielded = false;
    let ranBeforeYielding = 0;
    setTimeout(() => {
      hasYielded = true;
    }, 0);
    for (let i = 0; i < 6; i += 1) {
      defaultScheduler.background(() => {
        if (!hasYielded) ranBeforeYielding += 1;
        const until = performance.now() + 4;
        while (performance.now() < until) {}
      });
    }
    await defaultScheduler.whenIdle();
    expect(ranBeforeYielding).toBeLessThan(6);
  });

  it('drains without any animation frame being requested', async () => {
    await defaultScheduler.whenIdle();
    const spy = vi.spyOn(globalThis, 'requestAnimationFrame');
    let ran = false;
    defaultScheduler.background(() => (ran = true));
    await defaultScheduler.whenIdle();
    expect(ran).toBe(true);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('reports a native background-post rejection and continues through the fallback', async () => {
    const failure = new Error('native post failed');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    document.addEventListener(
      EVENTS.diagnostic,
      (event) => {
        event.preventDefault();
        diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
      },
      { once: true },
    );
    vi.stubGlobal('scheduler', {
      postTask: () => Promise.reject(failure),
    });

    try {
      const task = defaultScheduler.background(() => 'continued');
      await expect(task.promise).resolves.toBe('continued');
    } finally {
      vi.unstubAllGlobals();
    }

    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.scheduler.backgroundPostFailed,
        message: 'The native scheduler rejected a background post.',
        error: failure,
      },
    ]);
  });
});

describe('defaultScheduler.tick', () => {
  it('ticks once per frame, before the read phase', async () => {
    const phases: string[] = [];
    let ticks = 0;
    const unsubscribe = defaultScheduler.tick(() => {
      ticks += 1;
      phases.push(defaultScheduler.phase);
      defaultScheduler.read(() => phases.push(defaultScheduler.phase));
    });

    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(ticks).toBeGreaterThanOrEqual(1);
    expect(phases.slice(0, 2)).toEqual(['tick', 'read']);
  });

  it('isolates a failed tick callback and continues the tick', async () => {
    const failure = new Error('tick failure');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    document.addEventListener(
      EVENTS.diagnostic,
      (event) => {
        event.preventDefault();
        diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
      },
      { once: true },
    );
    let stopBroken = (): void => {};
    stopBroken = defaultScheduler.tick(() => {
      stopBroken();
      throw failure;
    });
    let healthyCalls = 0;
    let stopHealthy = (): void => {};
    stopHealthy = defaultScheduler.tick(() => {
      healthyCalls += 1;
      stopHealthy();
    });

    await nextFrame();

    expect(healthyCalls).toBe(1);
    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.schedulerTickFailed,
        message: 'A scheduler tick callback failed.',
        error: failure,
      },
    ]);
  });

  it('reports the time elapsed since the previous tick', async () => {
    const props: TickProps[] = [];
    const unsubscribe = defaultScheduler.tick((tickProps) => props.push(tickProps));

    await nextFrame();
    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(props.length).toBeGreaterThanOrEqual(2);
    expect(props[0].delta).toBe(1000 / 60);
    expect(props[1].delta).toBeGreaterThan(0);
    expect(props[1].time).toBeGreaterThan(props[0].time);
  });

  it('clamps the delta to [1, 40] ms', async () => {
    const deltas: number[] = [];
    const unsubscribe = defaultScheduler.tick(({ delta }) => deltas.push(delta));

    await nextFrame();
    await nextFrame();
    const until = performance.now() + 120;
    while (performance.now() < until) {}
    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(deltas.length).toBeGreaterThanOrEqual(3);
    for (const delta of deltas) {
      expect(delta).toBeGreaterThanOrEqual(1);
      expect(delta).toBeLessThanOrEqual(40);
    }
    expect(Math.max(...deltas)).toBe(40);
  });

  it('reports the frame timestamp, shared by every subscriber', async () => {
    await defaultScheduler.whenIdle();
    await nextFrame();

    const seen: number[] = [];
    const offOne = defaultScheduler.tick(({ time }) => seen.push(time));
    const offTwo = defaultScheduler.tick(({ time }) => seen.push(time));
    const rafTime = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    offOne();
    offTwo();

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).toBe(seen[1]);
    expect(seen[0]).toBe(rafTime);
  });

  it('waits until the next frame to call a callback added during a tick', async () => {
    let firstTicks = 0;
    let addedTicks = 0;
    const added = () => {
      addedTicks += 1;
    };
    let unsubscribeAdded = (): void => {};
    const unsubscribeFirst = defaultScheduler.tick(() => {
      firstTicks += 1;
      unsubscribeAdded = defaultScheduler.tick(added);
    });

    await nextFrame();
    const afterFirstFrame = { firstTicks, addedTicks };
    await nextFrame();
    unsubscribeFirst();
    unsubscribeAdded();

    expect(afterFirstFrame).toEqual({ firstTicks: 1, addedTicks: 0 });
    expect({ firstTicks, addedTicks }).toEqual({ firstTicks: 2, addedTicks: 1 });
  });

  it('skips a callback removed before its turn in the same tick', async () => {
    const calls: string[] = [];
    let unsubscribeSecond = (): void => {};
    const unsubscribeFirst = defaultScheduler.tick(() => {
      calls.push('first');
      unsubscribeSecond();
    });
    unsubscribeSecond = defaultScheduler.tick(() => {
      calls.push('second');
    });

    await nextFrame();
    unsubscribeFirst();

    expect(calls).toEqual(['first']);
  });

  it('bounds repeated callback creation to one generation per frame', async () => {
    const unsubscribers: Array<() => void> = [];
    let runs = 0;
    const addCallback = () => {
      unsubscribers.push(
        defaultScheduler.tick(() => {
          runs += 1;
          if (runs < 10_000) {
            addCallback();
          }
        }),
      );
    };
    addCallback();

    await nextFrame();
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }

    expect(runs).toBe(1);
  });

  it('stops calling a callback once it unsubscribes', async () => {
    let ticks = 0;
    const unsubscribe = defaultScheduler.tick(() => {
      ticks += 1;
    });
    await nextFrame();
    await nextFrame();
    unsubscribe();

    const after = ticks;
    await nextFrame();
    await nextFrame();
    expect(ticks).toBe(after);
  });

  it('never keeps whenIdle() waiting', async () => {
    const unsubscribe = defaultScheduler.tick(() => {});
    await expect(defaultScheduler.whenIdle()).resolves.toBeUndefined();
    unsubscribe();
  });

  it('stops requesting frames when the last subscriber leaves', async () => {
    const unsubscribe = defaultScheduler.tick(() => {});
    await nextFrame();
    unsubscribe();

    await new Promise((resolve) => setTimeout(resolve, 50));
    const spy = vi.spyOn(globalThis, 'requestAnimationFrame');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
