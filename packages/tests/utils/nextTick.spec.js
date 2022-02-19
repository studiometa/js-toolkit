import { jest } from '@jest/globals';
import { nextTick, nextFrame, nextMicrotask } from '@studiometa/js-toolkit/utils';

describe('nextTick method', () => {
  it('should execute in order', async () => {
    const fn = jest.fn();

    fn('start');
    const promises = [
      nextTick(() => fn('nextTick')),
      nextFrame(() => fn('nextFrame')),
      nextMicrotask(() => fn('nextMicrotask')),
    ];
    fn('end');

    await Promise.all(promises);

    expect(fn.mock.calls).toMatchSnapshot();
    expect(fn).toHaveBeenCalledTimes(5);
  });
});
