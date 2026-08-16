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

  it('should leave the tasks it could not afford in the queue', async () => {
    const queue = new SmartQueue();
    const spy = vi.fn(task);

    for (let index = 0; index < 4; index += 1) {
      queue.add(() => spy(15));
    }

    await nextTick();
    expect(queue.tasks).toHaveLength(1);
    await nextTick();
    expect(queue.tasks).toHaveLength(0);
    expect(spy).toHaveBeenCalledTimes(4);
  });

  /**
   * The drain is what makes a page of thousands of components affordable: one
   * `$mount()` queues about six tasks, so the queue is tens of thousands deep
   * before the first turn runs. A drain costing more per task as the queue
   * grows turns that into a multi-second page, so this pins the whole queue
   * being emptied in a single turn.
   */
  it('should drain a deep queue in a single turn', () => {
    const queue = new SmartQueue();
    let ran = 0;

    for (let index = 0; index < 30_000; index += 1) {
      queue.tasks.push(() => {
        ran += 1;
      });
    }

    queue.run(queue.tasks);
    expect(ran).toBe(30_000);
    expect(queue.tasks).toHaveLength(0);
  });

  it('should pick up tasks queued while it is running', () => {
    const queue = new SmartQueue();
    const order: string[] = [];

    queue.tasks.push(() => {
      order.push('first');
      queue.tasks.push(() => order.push('nested'));
    });
    queue.tasks.push(() => order.push('second'));

    queue.run(queue.tasks);
    expect(order).toEqual(['first', 'second', 'nested']);
    expect(queue.tasks).toHaveLength(0);
  });

  it('should drop a throwing task and keep the ones after it', () => {
    const queue = new SmartQueue();
    const spy = vi.fn();

    queue.tasks.push(spy);
    queue.tasks.push(() => {
      throw new Error('nope');
    });
    queue.tasks.push(spy);

    expect(() => queue.run(queue.tasks)).toThrow('nope');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(queue.tasks).toHaveLength(1);

    queue.run(queue.tasks);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should resolve the promise of each added task', async () => {
    const queue = new SmartQueue();
    const values = await Promise.all([queue.add(() => 1), queue.add(() => 2)]);
    expect(values).toEqual([1, 2]);
  });
});
