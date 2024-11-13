import { describe, it, expect } from 'vitest';
import { Base, withName, withResponsiveOptions } from '@studiometa/js-toolkit';
import { ResponsiveOptionsManager } from '#private/Base/managers/ResponsiveOptionsManager.js';
import { h } from '#test-utils';

describe('The `withResponsiveOptions` decorator', () => {
  it('should use the `ResponsiveOptionsManager', () => {
    class Foo extends withResponsiveOptions(Base) {
      static config = {
        name: 'Foo',
      };
    }

    expect(new Foo(h('div')).$options).toBeInstanceOf(ResponsiveOptionsManager);
  });

  it('should configure responsive options', () => {
    class Foo extends withResponsiveOptions(Base, { responsiveOptions: ['foo', 'bar'] }) {
      static config = {
        name: 'Foo',
        options: {
          foo: String,
          bar: {
            type: Boolean,
          },
        },
      };
    }

    const foo = new Foo(h('div'));
    expect(foo.__config.options.foo).toEqual({ type: String, responsive: true });
    expect(foo.__config.options.bar).toEqual({ type: Boolean, responsive: true });

    const Bar = withName(Base, 'Bar');
    const ResponsiveBar = withResponsiveOptions(Bar, { responsiveOptions: ['foo'] });

    const bar = new Bar(h('div'));
    const responsiveBar = new ResponsiveBar(h('div'));
    expect(bar.__config.options).toEqual(responsiveBar.__config.options);
  });
});
