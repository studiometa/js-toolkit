import { describe, expect, it } from 'vitest';
import { scheduler } from './scheduler';

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
