import { describe, expect, it, vi } from 'vitest';
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
    // Ran in a later frame, not synchronously after the write.
    expect(frames[0]).toBeGreaterThan(0);
  });

  it('survives a throwing task, and reports it', async () => {
    const reported: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      reported.push(event.error);
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener('error', onError, { capture: true });

    try {
      const task = defaultScheduler.write(() => {
        throw new Error('boom');
      });
      await expect(task.promise).rejects.toThrow('boom');

      const after = defaultScheduler.write(() => 'still alive');
      await expect(after.promise).resolves.toBe('still alive');
    } finally {
      window.removeEventListener('error', onError, { capture: true });
    }

    // `reportError()`, not `console.error()`: the platform's error channel is
    // what an error reporter is listening to.
    expect(reported).toHaveLength(1);
    expect((reported[0] as Error).message).toBe('boom');
  });

  it('resolves task promises with return values and supports cancel', async () => {
    const canceled = defaultScheduler.read(() => 'never');
    canceled.cancel();
    const kept = defaultScheduler.read(() => 42);
    await expect(kept.promise).resolves.toBe(42);
    await expect(canceled.promise).resolves.toBeUndefined();
  });

  // Regression: `while ((item = queue.shift()))` drained a phase until it
  // was empty, so a task re-scheduling itself into its own phase re-entered
  // within the same frame, without end. 100,000 chained reads used to run
  // in one frame, with no paint and no yield.
  it('does not loop forever when a read schedules a read', async () => {
    let runs = 0;
    // The chain is bounded per frame, so it outlives the test window: the
    // flag stops it, otherwise the next tests would run against a read
    // queue that is never empty.
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

  // The anti-thrashing rule the whole design rests on: bounding same-phase
  // re-entrancy must not cost the cross-phase guarantee.
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
    // Well within one 60 Hz frame: no frame boundary between the two.
    expect(writeTime - readTime).toBeLessThan(8);
  });
});

describe('defaultScheduler.background', () => {
  // Regression: the lane used to drain inside the rAF callback, against a
  // budget measured from the top of the flush. One busy tick subscriber —
  // a single running animation — spent the whole budget before the lane was
  // reached, and nothing mounted for as long as the animation ran.
  it('still drains background work while every frame is busy', async () => {
    let background = 0;
    const off = defaultScheduler.tick(() => {
      const until = performance.now() + 10;
      while (performance.now() < until) {
        /* occupy the frame */
      }
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
    // Each task spends most of the time slice, so a turn fits two of them
    // and the lane has to hand the thread back to finish the six.
    for (let i = 0; i < 6; i += 1) {
      defaultScheduler.background(() => {
        if (!hasYielded) ranBeforeYielding += 1;
        const until = performance.now() + 4;
        while (performance.now() < until) {
          /* spend the slice */
        }
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
});

describe('defaultScheduler.tick', () => {
  it('ticks once per frame, before the read phase', async () => {
    const phases: string[] = [];
    let ticks = 0;
    const unsubscribe = defaultScheduler.tick(() => {
      ticks += 1;
      phases.push(defaultScheduler.phase);
      // Scheduled from the tick, so it belongs to the same frame.
      defaultScheduler.read(() => phases.push(defaultScheduler.phase));
    });

    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(ticks).toBeGreaterThanOrEqual(1);
    expect(phases.slice(0, 2)).toEqual(['tick', 'read']);
  });

  it('reports the time elapsed since the previous tick', async () => {
    const props: TickProps[] = [];
    const unsubscribe = defaultScheduler.tick((tickProps) => props.push(tickProps));

    await nextFrame();
    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(props.length).toBeGreaterThanOrEqual(2);
    // The first tick has no previous frame to measure against, so it
    // reports one 60 Hz frame rather than a zero that would freeze anything
    // integrating it.
    expect(props[0].delta).toBe(1000 / 60);
    expect(props[1].delta).toBeGreaterThan(0);
    expect(props[1].time).toBeGreaterThan(props[0].time);
  });

  it('clamps the delta to [1, 40] ms', async () => {
    const deltas: number[] = [];
    const unsubscribe = defaultScheduler.tick(({ delta }) => deltas.push(delta));

    await nextFrame();
    await nextFrame();
    // A long task between two frames: the wall clock jumps, the delta must
    // not — a subscriber integrating it would jump with it.
    const until = performance.now() + 120;
    while (performance.now() < until) {
      /* stall the main thread */
    }
    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(deltas.length).toBeGreaterThanOrEqual(3);
    for (const delta of deltas) {
      expect(delta).toBeGreaterThanOrEqual(1);
      expect(delta).toBeLessThanOrEqual(40);
    }
    // The stall really did produce a gap the clamp had to absorb.
    expect(Math.max(...deltas)).toBe(40);
  });

  it('reports the frame timestamp, shared by every subscriber', async () => {
    // Nothing pending, so the first flush below belongs to the frame this
    // test requests and to no earlier one.
    await defaultScheduler.whenIdle();
    await nextFrame();

    const seen: number[] = [];
    const offOne = defaultScheduler.tick(({ time }) => seen.push(time));
    const offTwo = defaultScheduler.tick(({ time }) => seen.push(time));
    // Requested in the same task as the subscriptions, so this callback and
    // the scheduler's flush are in the same frame batch — and every callback
    // of a batch is handed the very same timestamp.
    const rafTime = await new Promise<number>((resolve) => requestAnimationFrame(resolve));
    offOne();
    offTwo();

    expect(seen.length).toBeGreaterThanOrEqual(2);
    // Both subscribers observe one frame's time, not two readings of a clock.
    expect(seen[0]).toBe(seen[1]);
    // And it is the frame's own timestamp. Compared against rAF's rather
    // than `performance.now()` on purpose: a `now()` read at the top of the
    // flush would land a fraction of a millisecond away and pass any
    // tolerance, while drifting against `document.timeline` all the same.
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

    // Live Set iteration would call all 10,000 newly added callbacks in this
    // flush. A frame snapshot runs only the generation present at its start.
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
    // The loop runs, but running is not queued work.
    await expect(defaultScheduler.whenIdle()).resolves.toBeUndefined();
    unsubscribe();
  });

  it('stops requesting frames when the last subscriber leaves', async () => {
    const unsubscribe = defaultScheduler.tick(() => {});
    await nextFrame();
    unsubscribe();

    // Let the frame already requested run out, then watch a few go by
    // without touching `requestAnimationFrame` from the test itself.
    await new Promise((resolve) => setTimeout(resolve, 50));
    const spy = vi.spyOn(globalThis, 'requestAnimationFrame');
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
