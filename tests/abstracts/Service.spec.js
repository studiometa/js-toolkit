/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Service from '../../src/abstracts/Service';

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

  it('should be implemented with the `props` getter.', () => {
    class Foo extends Service {}
    const foo = new Foo();

    expect(() => foo.props).toThrow('The `props` getter must be implemented.');
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
});
