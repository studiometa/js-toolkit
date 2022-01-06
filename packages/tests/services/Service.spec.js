/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import { jest } from '@jest/globals';
import Service from '@studiometa/js-toolkit/services/Service';

describe('The abstract Service class', () => {
  it('should be implemented with the `init` and `kill` methods', () => {
    class Foo extends Service {
      get props() {
        return {};
      }
    }
    const foo = new Foo();

    expect(() => {
      foo.init();
    }).toThrow('The `init` method must be implemented.');

    expect(() => {
      foo.kill();
    }).toThrow('The `kill` method must be implemented.');
  });

  it('should be implemented with the `updateProps` method.', () => {
    class Foo extends Service {}
    const foo = new Foo();

    expect(() => foo.updateProps()).toThrow('The `updateProps` method must be implemented.');
  });

  it('should be able to get the callback for a given key.', () => {
    class Foo extends Service {
      init() {}

      kill() {}
    }
    const foo = new Foo();
    const fn = jest.fn();
    foo.add('key', fn);

    expect(foo.get('key')).toBe(fn);
  });

  it('should be killed when removing all callbacks', () => {
    const fn = jest.fn();
    class Foo extends Service {
      init() {
        fn();
      }

      kill() {
        fn();
      }
    }
    const foo = new Foo();

    expect(foo.isInit).toBe(false);
    expect(foo.callbacks.size).toBe(0);
    expect(fn).toHaveBeenCalledTimes(0);

    foo.add('key', () => {});
    expect(foo.isInit).toBe(true);
    expect(foo.callbacks.size).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);

    foo.add('otherKey', () => {});
    expect(foo.isInit).toBe(true);
    expect(foo.callbacks.size).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);

    foo.remove('key');
    expect(foo.isInit).toBe(true);
    expect(foo.callbacks.size).toBe(1);
    expect(fn).toHaveBeenCalledTimes(1);

    foo.remove('otherKey');
    expect(foo.isInit).toBe(false);
    expect(foo.callbacks.size).toBe(0);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
