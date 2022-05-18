import { jest } from '@jest/globals';
import useRaf from '@studiometa/js-toolkit/services/raf';
import wait from '../__utils__/wait.js';

describe('useRaf', () => {
  const { add, remove, props } = useRaf();
  let rafProps;
  let fn;

  beforeEach(() => {
    remove('key');
    fn = jest.fn((p) => {
      rafProps = p;
    });
    add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should have a `time` prop', async () => {
    await wait(16);
    await wait(16);
    await wait(16);
    expect(typeof props().time).toBe('number');
    expect(typeof rafProps.time).toBe('number');
  });

  it('should trigger the callbkacks', async () => {
    await wait(16);
    await wait(16);
    await wait(16);
    expect(fn).toHaveBeenCalled();
    await wait(16);
    expect(fn.mock.calls.length).toBeGreaterThan(1);
    remove('key');
    await wait(16);
    expect(fn.mock.calls).toHaveLength(4);
  });

  it('should stop triggering when having no callback', async () => {
    remove('key');
    await wait(16);
    expect(fn).not.toHaveBeenCalled();
  });
});
