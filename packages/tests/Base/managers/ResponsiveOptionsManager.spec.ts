import { describe, it, expect, vi } from 'vitest';
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';
import { h, mockFeatures, useMatchMedia } from '#test-utils';

function componentWithOptions(content, options) {
  useMatchMedia();
  mockFeatures();
  const div = h('div');
  div.innerHTML = content;
  const element = div.firstElementChild;

  class Foo extends withResponsiveOptions(Base) {
    static config = {
      name: 'Foo',
      options,
    };
  }

  const instance = new Foo(element);

  return instance;
}

describe('The ResponsiveOptionsManager class', () => {
  it('should return the values for the active breakpoint', () => {
    const instance = componentWithOptions(
      `<div
        data-option-str-str="foo"
        data-option-str-str:l="bar"
        data-option-foo="foo"
        data-option-foo:l="l:foo"></div>
      `,
      {
        strStr: { type: String, responsive: true },
        foo: String,
      },
    );
    expect(instance.$options.strStr).toBe('bar');
    expect(instance.$options.foo).toBe('foo');
  });

  it('should warn when trying to set the value of a responsive option.', () => {
    const instance = componentWithOptions(
      '<div data-option-str="foo" data-option-str:l="bar"></div>',
      {
        str: { type: String, responsive: true },
        foo: String,
      },
    );

    const warnMock = vi.spyOn(console, 'warn');
    warnMock.mockImplementation(() => null);
    instance.$options.str = 'baz';
    expect(warnMock).toHaveBeenCalledWith('[Foo]', 'Responsive options are read-only.');
    instance.$options.foo = 'foo';
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });
});
