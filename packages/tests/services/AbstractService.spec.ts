import { describe, it, expect, vi } from 'vitest';
import { AbstractService } from '@studiometa/js-toolkit';

function getContext() {
  const props = {};
  const fn = vi.fn();

  class TestService extends AbstractService<any> {
    props = props;

    init() {
      fn('init');
    }

    kill() {
      fn('kill');
    }
  }

  const service = new TestService();

  return {
    TestService,
    service,
    fn,
  };
}

describe('The `Service` class', () => {
  it('should implement `add`, `has`, `get` and `remove` methods', () => {
    const { service } = getContext();
    const fn = vi.fn();
    service.add('key', fn);
    expect(service.has('key')).toBe(true);
    expect(service.get('key')).toBe(fn);
    service.remove('key');
    expect(service.has('key')).toBe(false);
  });

  it('should init and kill itself when adding or removing a callback', () => {
    const { service, fn } = getContext();
    service.add('key', () => fn('callback'));
    expect(service.isInit).toBe(true);
    expect(fn).toHaveBeenLastCalledWith('init');
    service.remove('key');
    expect(service.isInit).toBe(false);
    expect(fn).toHaveBeenLastCalledWith('kill');
  });

  it('should execute callbacks with the `trigger` method', () => {
    const { service, fn } = getContext();
    service.add('key', fn);
    service.trigger(service.props);
    expect(fn).toHaveBeenLastCalledWith(service.props);
    service.remove('key');
  });

  it('should prevent adding the same key multiple times', () => {
    const { service, fn } = getContext();
    service.add('key', fn);
    service.add('key', vi.fn());
    expect(service.get('key')).toBe(fn);
  });

  it('should instantiate an instance as a singleton with the `getInstance` static method', () => {
    const { TestService } = getContext();
    const instanceA = TestService.getInstance();
    expect(instanceA).toBe(TestService.getInstance());
    expect(instanceA).not.toBe(TestService.getInstance('key'));
  });
});
