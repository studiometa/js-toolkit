import { describe, it, expect, vi } from 'vitest';
import { Queue, nextTick } from '@studiometa/js-toolkit/utils';

describe('The `Queue` class', () => {
  it('should run multiple functions in queue', async () => {
    const queue = new Queue(1, nextTick);
    const spy = vi.fn();

    queue.add(spy);
    queue.add(spy);
    queue.add(spy);
    expect(spy).toHaveBeenCalledTimes(0);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should default to an immediate waiter', () => {
    const queue = new Queue(1);
    const spy = vi.fn();

    queue.add(spy);
    queue.add(spy);
    queue.add(spy);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should return a promise when adding a task', async () => {
    const queue = new Queue(1, nextTick);
    const spy = vi.fn();
    const p = queue.add(spy);
    expect(p).toBeInstanceOf(Promise);
    expect(spy).toHaveBeenCalledTimes(0);
    await p;
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should keep running the rest of the batch when a task throws', async () => {
    // Use a manual waiter so all three tasks land in a single pending batch and
    // one flush drains them together — this is what exercises the same-batch
    // isolation (an immediate waiter would flush each `add()` on its own).
    let scheduled: (() => void) | undefined;
    const queue = new Queue(10, (cb) => {
      scheduled = cb as () => void;
    });
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

    // Nothing ran yet: all three tasks share the same pending batch.
    expect(before).not.toHaveBeenCalled();

    // Trigger the single flush that drains the whole batch.
    scheduled?.();

    // The throwing task must not abort the tasks queued before or after it.
    expect(before).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);

    // The failure is surfaced through the task's own promise, which rejects.
    await expect(throwing).rejects.toBe(error);
  });

  it('should not wedge the queue for future flushes when a task throws', () => {
    const queue = new Queue(10);

    const throwing = queue.add(() => {
      throw new Error('boom');
    });
    // Observe the rejection so it does not surface as an unhandled rejection.
    throwing.catch(() => {});

    // The scheduling flag must have been reset by the previous flush.
    expect(queue.isScheduled).toBe(false);

    // A subsequent enqueue must still schedule and run.
    const spy = vi.fn();
    queue.add(spy);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should reject consistently for sync and async throws', async () => {
    const queue = new Queue(10);
    const error = new Error('boom');

    const sync = queue.add(() => {
      throw error;
    });
    const async = queue.add(async () => {
      throw error;
    });

    await expect(sync).rejects.toBe(error);
    await expect(async).rejects.toBe(error);
  });

  it('should reset the scheduling flag when the scheduler throws', () => {
    const error = new Error('scheduler boom');
    const queue = new Queue(1, () => {
      throw error;
    });

    // The throw propagates to the caller...
    expect(() =>
      queue.add(() => {
        /* noop */
      }),
    ).toThrow(error);

    // ...but the flag is reset so the queue is not permanently wedged.
    expect(queue.isScheduled).toBe(false);
  });

  it('should keep the pending task queued when the scheduler throws', () => {
    let broken = true;
    const queue = new Queue(10, (cb) => {
      if (broken) {
        throw new Error('scheduler boom');
      }
      (cb as () => void)();
    });
    const spy = vi.fn();

    expect(() => queue.add(spy)).toThrow('scheduler boom');
    // The task is not dropped: it is still queued, waiting for a flush that
    // does get scheduled. Rejecting it here would be unobservable, since the
    // throw pre-empted `add()` returning its promise.
    expect(queue.tasks).toHaveLength(1);
    expect(spy).not.toHaveBeenCalled();

    // Once the scheduler works again, the orphaned task runs with the next one.
    broken = false;
    const next = vi.fn();
    queue.add(next);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
