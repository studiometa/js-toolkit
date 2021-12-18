import { describe, beforeAll, afterAll, it, sinon, expect } from 'vitest';
import debounce from '@studiometa/js-toolkit/utils/debounce';

describe('debounce method', () => {
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

  it('should wait the given delay to call given function', async () => {
    const fn = sinon.fake(() => true);
    const debounced = debounce(fn, 400);

    debounced();
    debounced();
    debounced();
    debounced();

    expect(fn).not.toHaveBeenCalled();

    clock.tick(150);
    expect(fn).not.toHaveBeenCalled();

    clock.tick(400);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should wait for 300ms when used without the delay parameter', async () => {
    const fn = sinon.fake(() => true);
    const debounced = debounce(fn);

    debounced();
    debounced();

    clock.tick(200);
    expect(fn).not.toHaveBeenCalled();
    clock.tick(301);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
