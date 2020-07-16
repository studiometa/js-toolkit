import useRaf from '~/services/raf';
import wait from '../__utils__/wait';

describe('useRaf', () => {
  const { add, remove, props } = useRaf();
  let rafProps;
  let fn;
  let instance;

  beforeEach(() => {
    remove('key');
    fn = jest.fn(p => {
      rafProps = p;
    });
    instance = add('key', fn);
  });

  it('should export the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  it('should have a `time` prop', async () => {
    await wait(16);
    expect(typeof props().time).toBe('number');
    expect(typeof rafProps.time).toBe('number');
  });

  it('should trigger the callbkacks', async () => {
    await wait(16);
    expect(fn).toHaveBeenCalled();
    let numberOfCalls = fn.mock.calls.length;
    await wait(16);
    expect(fn.mock.calls.length).toBeGreaterThan(numberOfCalls);
    remove('key');
    numberOfCalls = fn.mock.calls.length;
    await wait(16);
    expect(fn.mock.calls).toHaveLength(numberOfCalls);
  });

  it('should be ticking when having a callback', () => {
    expect(instance.callbacks.size).toBe(1);
    expect(instance.isTicking).toBe(true);
  });

  it('should stop ticking when having no callback', () => {
    remove('key');
    expect(instance.callbacks.size).toBe(0);
    expect(instance.isTicking).toBe(false);
  });
});
