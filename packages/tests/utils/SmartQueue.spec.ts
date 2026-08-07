import { describe, it, expect, vi } from 'vitest';
import { SmartQueue, nextTick } from '@studiometa/js-toolkit/utils';

function task(duration = 1) {
  const start = performance.now();
  let now = performance.now();
  while (now - start < duration) {
    now = performance.now();
  }
}

describe('The `SmartQueue` class', () => {
  it('should run multiple functions in queue without triggering long tasks', async () => {
    const queue = new SmartQueue();
    const spy = vi.fn(task);

    queue.add(() => spy(15));
    queue.add(() => spy(15));
    queue.add(() => spy(15));
    queue.add(() => spy(15));

    expect(spy).toHaveBeenCalledTimes(0);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(4);
  });

  it('should keep running the batch when a task throws', async () => {
    const queue = new SmartQueue();
    const before = vi.fn();
    const after = vi.fn();
    const error = new Error('boom');

    queue.add(before);
    // The throwing task's promise rejects; observe it so it is not reported as
    // an unhandled rejection.
    const throwing = queue.add(() => {
      throw error;
    });
    throwing.catch(() => {});
    queue.add(after);

    await nextTick();

    // Both the task before and after the throwing one must have run.
    expect(before).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    // The failure is surfaced through the task's own promise, which rejects.
    await expect(throwing).rejects.toBe(error);
  });

  it('should not wedge the queue for future flushes when a task throws', async () => {
    const queue = new SmartQueue();
    const spy = vi.fn();

    const throwing = queue.add(() => {
      throw new Error('boom');
    });
    // Observe the rejection so it does not surface as an unhandled rejection.
    throwing.catch(() => {});
    await nextTick();

    // The scheduling flag must have been reset by the previous flush.
    expect(queue.isScheduled).toBe(false);

    // A subsequent enqueue must still schedule and run.
    queue.add(spy);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should inherit the rejection contract for sync and async throws', async () => {
    const queue = new SmartQueue();
    const error = new Error('boom');

    // `SmartQueue` overrides neither `add()` nor the error isolation: a
    // synchronous throw rejects exactly like an `async` task whose promise
    // rejects. Observe both rejections right away so the flush below can not
    // report them as unhandled.
    const sync = queue.add(() => {
      throw error;
    });
    sync.catch(() => {});
    const async = queue.add(async () => {
      throw error;
    });
    async.catch(() => {});

    await nextTick();

    await expect(sync).rejects.toBe(error);
    await expect(async).rejects.toBe(error);
  });
});
