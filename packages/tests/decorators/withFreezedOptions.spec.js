import { jest } from '@jest/globals';
import { Base, withFreezedOptions } from '@studiometa/js-toolkit';

describe('The `withFreezedOptions` decorator', () => {
  class Foo extends withFreezedOptions(Base) {
    static config = {
      name: 'Foo',
      options: {
        bool: Boolean,
        str: String,
      },
    };
  }

  it('should transform the `$options` property to be read-only', () => {
    const foo = new Foo(document.createElement('div'));
    expect(foo.$options.bool).toBe(false);
    expect(() => {
      foo.$options.bool = true;
    }).toThrow();
    expect(foo.$options.bool).toBe(false);
  });

  it('should not break a component lifecycle', () => {
    const foo = new Foo(document.createElement('div'));
    foo.$mount();
    expect(foo.$isMounted).toBe(true);
    foo.$update();
    expect(foo.$isMounted).toBe(true);
    foo.$destroy();
    expect(foo.$isMounted).toBe(false);
    foo.$terminate();
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
