import { jest } from '@jest/globals';
import { nextTick, nextFrame, nextMicrotask } from '@studiometa/js-toolkit/utils';

describe('nextTick method', () => {
  it('should execute in order', async () => {
    const fn = jest.fn();

    fn('start');
    const promises = [
      nextTick(() => fn('nextTick #1')),
      nextTick().then(() => fn('nextTick #2')),
      nextFrame().then(() => fn('nextFrame #2')),
      nextFrame(() => fn('nextFrame #1')),
      nextMicrotask().then(() => fn('nextMicrotask #2')),
      nextMicrotask(() => fn('nextMicrotask #1')),
    ];
    fn('end');

    await Promise.all(promises);

    expect(fn.mock.calls).toMatchSnapshot();
    expect(fn).toHaveBeenCalledTimes(8);
  });
});
