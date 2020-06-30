/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Base from '../../src/abstracts/Base';

describe('The abstract Base class', () => {
  it('must be extended', () => {
    expect(() => {
      new Base();
    }).toThrow();
  });

  it('should throw an error when extended without proper configuration', () => {
    expect(() => {
      class Foo extends Base {}
      new Foo();
    }).toThrow('The `config` getter must be defined.');

    expect(() => {
      class Foo extends Base {
        get config() {
          return {};
        }
      }
      new Foo();
    }).toThrow('The `config.name` property is required.');
  });

  it('should throw an error if instantiated without a root element.', () => {
    expect(() => {
      class Foo extends Base {
        get config() {
          return { name: 'Foo' };
        }
      }
      new Foo();
    }).toThrow('The root element must be defined.');
  });
});

describe('A Base instance', () => {
  class Foo extends Base {
    get config() {
      return { name: 'Foo' };
    }
  }
  const element = document.createElement('div');
  const foo = new Foo(element);

  it('should have an `$id` property', () => {
    expect(foo.$id).toBeDefined();
  });

  it('should have an `$isMounted` property', () => {
    expect(foo.$isMounted).toBe(true);
  });

  it('should have a `$refs` property', () => {
    expect(foo.$refs).toEqual({});
  });

  it('should have a `$children` property', () => {
    expect(foo.$children).toEqual({});
  });

  it('should have an `$options` property', () => {
    expect(foo.$options).toEqual({ name: 'Foo' });
  });

  it('should have an `$el` property', () => {
    expect(foo.$el).toBe(element);
  });
});
