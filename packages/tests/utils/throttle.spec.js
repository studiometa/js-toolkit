import { describe, beforeAll, afterAll, it, expect, sinon } from 'vitest';
import throttle from '@studiometa/js-toolkit/utils/throttle';

describe('throttle method', () => {
  /**
   * @type {import('sinon').SinonFakeTimers}
   */
  let clock;

  beforeAll(() => {
    clock = sinon.useFakeTimers();
  });

  afterAll(() => {
    clock.restore();
  });

  it('should call the given function only once in the given delay', async () => {
    const fn = sinon.fake(() => true);
    const throttled = throttle(fn, 300);

    throttled();
    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);

    clock.tick(400);

    throttled();
    throttled();
    throttled();
    throttled();
    clock.tick(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should call the callback after 16ms when no delay provided', async () => {
    const fn = sinon.fake(() => true);
    const throttled = throttle(fn);

    throttled();
    clock.tick(10);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    clock.tick(20);
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
