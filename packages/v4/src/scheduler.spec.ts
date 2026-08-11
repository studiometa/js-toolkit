import { describe, expect, it, vi } from 'vitest';
import { nextFrame, scheduler, type FrameProps } from './scheduler.js';

describe('scheduler (real frames)', () => {
  it('runs reads before writes within one frame, regardless of scheduling order', async () => {
    const order: string[] = [];
    scheduler.write(() => order.push('write'));
    scheduler.read(() => order.push('read'));
    await scheduler.whenIdle();
    expect(order).toEqual(['read', 'write']);
  });

  it('defers a read scheduled from a write to the next frame', async () => {
    const frames: number[] = [];
    let firstFrame = 0;
    scheduler.write(() => {
      firstFrame = performance.now();
      scheduler.read(() => frames.push(performance.now() - firstFrame));
    });
    await scheduler.whenIdle();
    expect(frames).toHaveLength(1);
    // Ran in a later frame, not synchronously after the write.
    expect(frames[0]).toBeGreaterThan(0);
  });

  it('survives a throwing task', async () => {
    const task = scheduler.write(() => {
      throw new Error('boom');
    });
    await expect(task.promise).rejects.toThrow('boom');

    const after = scheduler.write(() => 'still alive');
    await expect(after.promise).resolves.toBe('still alive');
  });

  it('resolves task promises with return values and supports cancel', async () => {
    const canceled = scheduler.read(() => 'never');
    canceled.cancel();
    const kept = scheduler.read(() => 42);
    await expect(kept.promise).resolves.toBe(42);
    await expect(canceled.promise).resolves.toBeUndefined();
  });
});

describe('scheduler.frame', () => {
  it('ticks once per frame, before the read phase', async () => {
    const phases: string[] = [];
    let ticks = 0;
    const unsubscribe = scheduler.frame(() => {
      ticks += 1;
      phases.push(scheduler.phase);
      // Scheduled from the tick, so it belongs to the same frame.
      scheduler.read(() => phases.push(scheduler.phase));
    });

    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(ticks).toBeGreaterThanOrEqual(1);
    expect(phases.slice(0, 2)).toEqual(['frame', 'read']);
  });

  it('reports the time elapsed since the previous tick', async () => {
    const props: FrameProps[] = [];
    const unsubscribe = scheduler.frame((frameProps) => props.push(frameProps));

    await nextFrame();
    await nextFrame();
    await nextFrame();
    unsubscribe();

    expect(props.length).toBeGreaterThanOrEqual(2);
    // The first tick has no previous frame to measure against.
    expect(props[0].delta).toBe(0);
    expect(props[1].delta).toBeGreaterThan(0);
    expect(props[1].time).toBeGreaterThan(props[0].time);
  });

  it('reports the frame timestamp, shared by every subscriber', async () => {
    // Nothing pending, so the first flush below belongs to the frame this
    // test requests and to no earlier one.
    await scheduler.whenIdle();
    await nextFrame();

    const seen: number[] = [];
    const offOne = scheduler.frame(({ time }) => seen.push(time));
    const offTwo = scheduler.frame(({ time }) => seen.push(time));
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

  it('stops calling a callback once it unsubscribes', async () => {
    let ticks = 0;
    const unsubscribe = scheduler.frame(() => {
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
    const unsubscribe = scheduler.frame(() => {});
    // The loop runs, but running is not queued work.
    await expect(scheduler.whenIdle()).resolves.toBeUndefined();
    unsubscribe();
  });

  it('stops requesting frames when the last subscriber leaves', async () => {
    const unsubscribe = scheduler.frame(() => {});
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
