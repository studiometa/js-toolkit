import { html } from 'htl';
import Options from '~/abstracts/Base/classes/Options';

describe('The Options class', () => {
  it('should throw an error when using an unknown type', () => {
    expect(
      () =>
        new Options(html`<div></div>`, {
          foo: Map,
        })
    ).toThrow(
      'The "foo" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.'
    );
  });

  it('should throw an error when setting value with the wrong type', () => {
    const div = html`<div data-option-foo="bar"></div>`;
    const options = new Options(div, {
      string: String,
      number: Number,
      boolean: Boolean,
      array: Array,
      object: Object,
    });

    expect(() => {
      options.string = 10;
    }).toThrow('The "10" value for the "string" option must be of type "String"');

    expect(() => {
      options.number = 'string';
    }).toThrow('The "string" value for the "number" option must be of type "Number"');

    expect(() => {
      options.boolean = [];
    }).toThrow('The "[]" value for the "boolean" option must be of type "Boolean"');

    expect(() => {
      options.array = {};
    }).toThrow('The "{}" value for the "array" option must be of type "Array"');

    expect(() => {
      options.object = true;
    }).toThrow('The "true" value for the "object" option must be of type "Object"');
  });

  it('should get and set string options', () => {
    const div = html`<div data-option-foo="bar"></div>`;
    const options = new Options(div, {
      foo: String,
    });

    expect(options.foo).toBe('bar');
    options.foo = 'baz';
    expect(div.getAttribute('data-option-foo')).toBe('baz');
    expect(options.foo).toBe('baz');
  });

  it('should get and set number options', () => {
    const div = html`<div data-option-foo="0"></div>`;
    const options = new Options(div, {
      foo: Number,
    });

    expect(options.foo).toBe(0);
    options.foo = 1.5;
    expect(div.getAttribute('data-option-foo')).toBe('1.5');
    expect(options.foo).toBe(1.5);
  });

  it('should get and set boolean options', () => {
    const div = html`<div data-option-foo></div>`;
    const options = new Options(div, {
      foo: Boolean,
    });

    expect(options.foo).toBe(true);
    options.foo = false;
    expect(div.hasAttribute('data-option-foo')).toBe(false);
    expect(options.foo).toBe(false);
    options.foo = true;
    expect(div.hasAttribute('data-option-foo')).toBe(true);
    expect(options.foo).toBe(true);
  });

  it('should get and set array options', () => {
    const div = html`<div data-option-foo="[1, 2]"></div>`;
    const options = new Options(div, {
      foo: Array,
    });

    expect(options.foo).toEqual([1, 2]);
    options.foo = [1, 2, 3];
    expect(options.foo).toEqual([1, 2, 3]);
    options.foo.push(4);
    // expect(options.foo).toEqual([1, 2, 3, 4]);
    expect(div.outerHTML).toBe('<div data-option-foo="[1,2,3]"></div>');

    return new Promise((resolve) => {
      setTimeout(() => {
        expect(div.outerHTML).toBe('<div data-option-foo="[1,2,3,4]"></div>');
        resolve();
      }, 0);
    });
  });

  it('should get and set object options', () => {
    const div = html`<div data-option-foo="${JSON.stringify({ foo: 1 })}"></div>`;
    const options = new Options(div, {
      foo: Object,
    });

    expect(options.foo).toEqual({ foo: 1 });
    options.foo = { bar: 2 };
    expect(options.foo).toEqual({ bar: 2 });
    options.foo.foo = 'foo';
    expect(options.foo).toEqual({ bar: 2, foo: 'foo' });
  });

  it('should return the default values when there is no data-attribute', () => {
    const div = html`<div />`;
    const options = new Options(div, {
      string: String,
      number: Number,
      boolean: Boolean,
      array: Array,
      object: Object,
      stringWithDefault: { type: String, default: 'foo' },
      numberWithDefault: { type: Number, default: 10 },
      booleanWithDefault: { type: Boolean, default: true },
      arrayWithDefault: { type: Array, default: () => [1, 2, 3] },
      objectWithDefault: { type: Object, default: () => ({ foo: 'foo' }) },
    });

    expect(options.string).toBe('');
    expect(options.number).toBe(0);
    expect(options.boolean).toBe(false);
    expect(options.array).toEqual([]);
    expect(options.object).toEqual({});

    expect(options.stringWithDefault).toBe('foo');
    expect(options.numberWithDefault).toBe(10);
    expect(options.booleanWithDefault).toBe(true);
    expect(div.hasAttribute('data-option-boolean-with-default')).toBe(true);
    expect(options.arrayWithDefault).toEqual([1, 2, 3]);
    expect(options.objectWithDefault).toEqual({ foo: 'foo' });
  });

  it('should throw an error when default values for types Object or Array are not functions', () => {
    expect(
      () =>
        new Options(html`<div />`, {
          array: [Array, [1, 2, 3]],
        })
    ).toThrow(
      'The "array" option has an invalid type. The allowed types are: String, Number, Boolean, Array and Object.'
    );
  });

  // it('should not allow to add unconfigured properties', () => {
  //   const div = html`<div data-option-string="foo" />`;
  //   const options = new Options(div, {
  //     string: String,
  //     number: Number,
  //     boolean: Boolean,
  //     array: Array,
  //     object: Object,
  //   });

  //   expect(() => {
  //     options.foo = 'bar';
  //   }).toThrow('Cannot add property foo, object is not extensible');

  //   expect(() => {
  //     options.string = 'bar';
  //     options.number += 1;
  //     options.boolean = true;
  //     options.array = [1, 2];
  //     options.array.push(3);
  //     options.object = { foo: 'bar' };
  //     options.object.foo = 'foo';
  //     options.object.baz = 'baz';
  //   }).not.toThrow('Cannot add property foo, object is not extensible');
  // });
});
