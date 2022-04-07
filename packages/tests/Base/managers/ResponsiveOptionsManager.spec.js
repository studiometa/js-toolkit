import { jest } from '@jest/globals';
import { Base, withExtraConfig } from '@studiometa/js-toolkit';
import ResponsiveOptionsManager from '@studiometa/js-toolkit/Base/managers/ResponsiveOptionsManager';
import { mockBreakpoints, unmockBreakpoints } from '../../__setup__/mockBreakpoints.js';

class Foo extends Base {
  static config = {
    name: 'Base',
  };

  get __managers() {
    return {
      ...super.__managers,
      OptionsManager: ResponsiveOptionsManager,
    };
  }
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
  document.body.dataset.breakpoint = '';
});

describe('The ResponsiveOptionsManager class', () => {
  it('should return the values for the active breakpoint', () => {
    const instance = componentWithOptions(
      `<div
        data-option-str="foo"
        data-option-str[s]="baz"
        data-option-str[l]="bar"
        data-option-foo="foo"
        data-option-foo[l]="l:foo"></div>
      `,
      {
        str: { type: String, responsive: true },
        foo: String,
      }
    );

    expect(instance.$options.str).toBe('bar');
    expect(instance.$options.foo).toBe('foo');
  });

  it('should warn when trying to set the value of a responsive option.', () => {
    const instance = componentWithOptions(
      '<div data-option-str="foo" data-option-str[l]="bar"></div>',
      {
        str: { type: String, responsive: true },
        foo: String,
      }
    );

    const warnMock = jest.spyOn(console, 'warn');
    warnMock.mockImplementation(() => null);
    instance.$options.str = 'baz';
    expect(warnMock).toHaveBeenCalledWith(
      '[BaseWithExtraConfig]',
      'Responsive options are read-only.'
    );
    instance.$options.foo = 'foo';
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });

  it('should fail silently when no breakpoint are defined', () => {
    const instance = componentWithOptions(
      '<div data-option-str="foo" data-option-str[l]="bar"></div>',
      {
        str: { type: String, responsive: true },
        foo: String,
      }
    );

    unmockBreakpoints();
    expect(instance.$options.str).toBe('foo');
    mockBreakpoints();
  });
});
