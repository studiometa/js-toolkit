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

  it('should run one batch of `concurrency` tasks per flush', async () => {
    const queue = new Queue(2, nextTick);
    const spy = vi.fn();

    for (let index = 0; index < 5; index += 1) {
      queue.add(spy);
    }

    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(queue.tasks).toHaveLength(3);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(4);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(5);
    expect(queue.tasks).toHaveLength(0);
  });

  it('should empty the array it is given', () => {
    const queue = new Queue(10);
    const spy = vi.fn();
    const tasks = [spy, spy, spy];

    queue.run(tasks);
    expect(spy).toHaveBeenCalledTimes(3);
    expect(tasks).toHaveLength(0);
  });

  it('should pick up tasks pushed while it is running', () => {
    const queue = new Queue(10);
    const order: string[] = [];
    const tasks = [
      () => {
        order.push('first');
        tasks.push(() => order.push('nested'));
      },
      () => order.push('second'),
    ];

    queue.run(tasks);
    expect(order).toEqual(['first', 'second', 'nested']);
    expect(tasks).toHaveLength(0);
  });

  it('should drop a throwing task and keep the ones after it', () => {
    const queue = new Queue(10);
    const spy = vi.fn();
    const tasks = [
      spy,
      () => {
        throw new Error('nope');
      },
      spy,
    ];

    expect(() => queue.run(tasks)).toThrow('nope');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(tasks).toHaveLength(1);

    queue.run(tasks);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
