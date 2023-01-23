import { jest } from '@jest/globals';
import { Queue, nextTick } from '@studiometa/js-toolkit/utils';

describe('The `Queue` class', () => {
  it('should run multiple functions in queue', async () => {
    const queue = new Queue(1, nextTick);
    const spy = jest.fn();

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
    const spy = jest.fn();

    queue.add(spy);
    queue.add(spy);
    queue.add(spy);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
