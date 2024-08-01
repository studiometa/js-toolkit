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
    expect.poll(spy).toHaveBeenCalledTimes(3);
    await nextTick();
    expect.poll(spy).toHaveBeenCalledTimes(4);
  });
});
