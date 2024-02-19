import { describe, it, expect, jest, beforeAll } from 'bun:test';
import { Base, withExtraConfig, withResponsiveOptions } from '@studiometa/js-toolkit';
import { matchMedia } from '../../__utils__/matchMedia.js';

class Foo extends withResponsiveOptions(Base) {
  static config = {
    name: 'Base',
  };
}

function componentWithOptions(content, options) {
  const div = document.createElement('div');
  div.innerHTML = content;
  const element = div.firstElementChild;
  return new (withExtraConfig(Foo, {
    options,
  }))(element);
}

beforeAll(() => {
  matchMedia.useMediaQuery('(min-width: 80rem)');
  document.body.dataset.breakpoint = '';
});

describe('The ResponsiveOptionsManager class', () => {
  it('should return the values for the active breakpoint', () => {
    const instance = componentWithOptions(
      `<div
        data-option-str="foo"
        data-option-str:s="baz"
        data-option-str:l="bar"
        data-option-foo="foo"
        data-option-foo:l="l:foo"></div>
      `,
      {
        str: { type: String, responsive: true },
        foo: String,
      },
    );

    expect(instance.$options.str).toBe('bar');
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

    const warnMock = jest.spyOn(console, 'warn');
    warnMock.mockImplementation(() => null);
    instance.$options.str = 'baz';
    expect(warnMock).toHaveBeenCalledWith(
      '[BaseWithExtraConfig]',
      'Responsive options are read-only.',
    );
    instance.$options.foo = 'foo';
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });
});
