/* eslint-disable unicorn/prefer-dom-node-dataset */
import { describe, it, expect } from 'bun:test';
import { Base, BaseConfig, withExtraConfig } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

function componentWithOptions(content, options) {
  const div = h('div');
  div.innerHTML = content;
  const element = div.firstElementChild;

  class Foo extends Base {
    static config: BaseConfig = {
      name: 'Foo',
      options,
    };
  }

  const instance = new Foo(element);

  return instance;
}

describe('The Options class', () => {
  it('should throw an error when using an unknown type', () => {
    expect(() => {
      return componentWithOptions('<div></div>', {
        foo: Map,
      });
    }).toThrow(
      'The "foo" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.',
    );
  });

  it('should throw an error when setting value with the wrong type', () => {
    const instance = componentWithOptions('<div data-option-foo="bar"></div>', {
      string: String,
      number: Number,
      boolean: Boolean,
      array: Array,
      object: Object,
    });

    expect(() => {
      instance.$options.string = 10;
    }).toThrow('The "10" value for the "string" option must be of type "String"');

    expect(() => {
      instance.$options.number = 'string';
    }).toThrow('The "string" value for the "number" option must be of type "Number"');

    expect(() => {
      instance.$options.boolean = [];
    }).toThrow('The "[]" value for the "boolean" option must be of type "Boolean"');

    expect(() => {
      instance.$options.array = {};
    }).toThrow('The "{}" value for the "array" option must be of type "Array"');

    expect(() => {
      instance.$options.object = true;
    }).toThrow('The "true" value for the "object" option must be of type "Object"');
  });

  it('should get and set string options', () => {
    const instance = componentWithOptions('<div data-option-foo="bar"></div>', {
      foo: String,
    });

    expect(instance.$options.foo).toBe('bar');
    instance.$options.foo = 'baz';
    expect(instance.$el.getAttribute('data-option-foo')).toBe('baz');
    expect(instance.$options.foo).toBe('baz');
  });

  it('should get and set number options', () => {
    const instance = componentWithOptions('<div data-option-foo="0"></div>', {
      foo: Number,
    });

    expect(instance.$options.foo).toBe(0);
    instance.$options.foo = 1.5;
    expect(instance.$el.getAttribute('data-option-foo')).toBe('1.5');
    expect(instance.$options.foo).toBe(1.5);
  });

  it('should get and set boolean options', () => {
    const instance = componentWithOptions('<div data-option-foo></div>', {
      foo: Boolean,
    });

    expect(instance.$options.foo).toBe(true);
    instance.$options.foo = false;
    expect(instance.$el.hasAttribute('data-option-foo')).toBe(false);
    expect(instance.$options.foo).toBe(false);
    instance.$options.foo = true;
    expect(instance.$el.hasAttribute('data-option-foo')).toBe(true);
    expect(instance.$options.foo).toBe(true);
  });

  it('should get falsy boolean options', () => {
    const instance = componentWithOptions('<div data-option-no-foo></div>', {
      foo: { type: Boolean, default: true },
    });

    expect(instance.$options.foo).toBe(false);
    expect(instance.$el.hasAttribute('data-option-foo')).toBe(false);
    expect(instance.$el.hasAttribute('data-option-no-foo')).toBe(true);
    instance.$options.foo = true;
    expect(instance.$options.foo).toBe(true);
    expect(instance.$el.hasAttribute('data-option-foo')).toBe(false);
    expect(instance.$el.hasAttribute('data-option-no-foo')).toBe(false);
    instance.$options.foo = false;
    expect(instance.$el.hasAttribute('data-option-no-foo')).toBe(true);
  });

  it('should get and set array options', () => {
    const instance = componentWithOptions('<div data-option-foo="[1, 2]"></div>', {
      foo: Array,
    });

    expect(instance.$options.foo).toEqual([1, 2]);
    instance.$options.foo = [1, 2, 3];
    expect(instance.$options.foo).toEqual([1, 2, 3]);
    instance.$options.foo.push(4);
    expect(instance.$options.foo).toEqual([1, 2, 3, 4]);
  });

  it('should get and set object options', () => {
    const instance = componentWithOptions(`<div data-option-foo='{ "foo": 1 }'></div>`, {
      foo: Object,
    });

    expect(instance.$options.foo).toEqual({ foo: 1 });
    instance.$options.foo = { bar: 2 };
    expect(instance.$options.foo).toEqual({ bar: 2 });
    instance.$options.foo.foo = 'foo';
    expect(instance.$options.foo).toEqual({ bar: 2, foo: 'foo' });
  });

  it('should merge array and object options', () => {
    const instance = componentWithOptions(
      `<div data-option-bar="[3,4]" data-option-foo='{ "key": "key" }'></div>`,
      {
        foo: {
          type: Object,
          default: () => ({ foo: 'foo' }),
          merge: true,
        },
        bar: {
          type: Array,
          default: () => [1, 2],
          merge: true,
        },
      },
    );

    expect(instance.$options.foo).toEqual({ foo: 'foo', key: 'key' });
    expect(instance.$options.bar).toEqual([1, 2, 3, 4]);
  });

  it('should return the default values when there is no data-attribute', () => {
    const instance = componentWithOptions('<div></div>', {
      string: String,
      number: Number,
      boolean: Boolean,
      array: Array,
      object: Object,
      stringWithDefault: { type: String, default: 'foo' },
      stringWithDefaultFn: { type: String, default: (i) => i.$id },
      numberWithDefault: { type: Number, default: 10 },
      numberWithDefaultFn: { type: Number, default: () => 10 },
      booleanWithDefault: { type: Boolean, default: true },
      booleanWithDefaultFn: { type: Boolean, default: (i) => i.$isMounted },
      arrayWithDefault: { type: Array, default: () => [1, 2, 3] },
      arrayWithDefaultFn: { type: Array, default: (i) => i.$options.arrayWithDefault },
      objectWithDefault: { type: Object, default: () => ({ foo: 'foo' }) },
    });

    expect(instance.$options.name).toBe('Foo');
    expect(instance.$options.string).toBe('');
    expect(instance.$options.number).toBe(0);
    expect(instance.$options.boolean).toBe(false);
    expect(instance.$options.array).toEqual([]);
    expect(instance.$options.object).toEqual({});

    expect(instance.$options.stringWithDefault).toBe('foo');
    expect(instance.$options.stringWithDefaultFn).toBe(instance.$id);
    expect(instance.$options.numberWithDefault).toBe(10);
    expect(instance.$options.numberWithDefaultFn).toBe(10);
    expect(instance.$options.booleanWithDefault).toBe(true);
    expect(instance.$options.booleanWithDefaultFn).toBe(instance.$isMounted);
    expect(instance.$el.hasAttribute('data-option-boolean-with-default')).toBe(false);
    expect(instance.$options.arrayWithDefault).toEqual([1, 2, 3]);
    expect(instance.$options.arrayWithDefaultFn).toEqual(instance.$options.arrayWithDefault);
    expect(instance.$options.objectWithDefault).toEqual({ foo: 'foo' });
  });

  it('should throw an error when default values for types Object or Array are not functions', () => {
    expect(() =>
      componentWithOptions('<div></div>', {
        array: { type: Array, default: [1, 2, 3] },
      }),
    ).toThrow('The default value for options of type "Array" must be returned by a function.');
  });
});
