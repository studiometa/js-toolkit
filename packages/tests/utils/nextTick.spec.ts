import { describe, it, expect, jest } from 'bun:test';
import { nextTick, nextFrame, nextMicrotask } from '@studiometa/js-toolkit/utils';

describe('nextTick method', () => {
  it('should execute in order', async () => {
    const fn = jest.fn();

    fn('start');
    const promises = [
      nextTick(() => fn('nextTick #1')),
      nextTick().then(() => fn('nextTick #2')),
      nextFrame(() => fn('nextFrame #1')),
      nextFrame().then(() => fn('nextFrame #2')),
      nextMicrotask().then(() => fn('nextMicrotask #2')),
      nextMicrotask(() => fn('nextMicrotask #1')),
    ];
    fn('end');

    await Promise.all(promises);

    console.log(fn.mock.calls);
    expect(fn.mock.calls).toEqual([
      ['start'],
      ['end'],
      ['nextMicrotask #1'],
      ['nextMicrotask #2'],
      ['nextTick #1'],
      ['nextTick #2'],
      ['nextFrame #1'],
      ['nextFrame #2'],
    ]);
    expect(fn).toHaveBeenCalledTimes(8);
  });
});
