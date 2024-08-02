import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, BaseConfig, withFreezedOptions } from '@studiometa/js-toolkit';
import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

describe('The `withFreezedOptions` decorator', () => {
  class Foo extends withFreezedOptions(Base) {
    static config: BaseConfig = {
      name: 'Foo',
      options: {
        bool: Boolean,
        str: String,
      },
    };
  }

  it('should transform the `$options` property to be read-only', async () => {
    const foo = new Foo(document.createElement('div'));
    expect(foo.$options.bool).toBe(false);
    expect(() => {
      foo.$options.bool = true;
    }).toThrow();
    expect(foo.$options.bool).toBe(false);
  });

  it('should not break a component lifecycle', async () => {
    const foo = new Foo(document.createElement('div'));
    foo.$mount();
    await advanceTimersByTimeAsync(1);
    expect(foo.$isMounted).toBe(true);
    foo.$update();
    await advanceTimersByTimeAsync(1);
    expect(foo.$isMounted).toBe(true);
    foo.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(foo.$isMounted).toBe(false);
    foo.$terminate();
    await advanceTimersByTimeAsync(1);
    expect(foo.$el.__base__.get(Foo)).toBe('terminated');
  });

  it('should still allow child class $option definition', () => {
    class Bar extends Foo {
      get $options() {
        const options = super.$options;

        return { ...options, str: 'bar' };
      }
    }

    const bar = new Bar(document.createElement('div'));
    expect(bar.$options.str).toBe('bar');
    bar.$options.str = 'foo';
    expect(bar.$options.str).toBe('bar');
  });
});
