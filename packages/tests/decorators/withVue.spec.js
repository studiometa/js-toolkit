import { jest } from '@jest/globals';
import { html } from 'htl';
import Base from '@studiometa/js-toolkit';
import withVue from '@studiometa/js-toolkit/decorators/withVue';

describe('The `withVue` decorator', () => {
  const fn = jest.fn();

  const VueComponent = {
    data: () => ({ name: 'world' }),
    render(h) {
      return h('p', {}, `Hello ${this.name}`);
    },
    mounted() {
      fn('mounted');
    },
    destroyed() {
      fn('destroyed');
    },
  };

  class Foo extends withVue(Base) {
    static vueConfig = {
      components: {
        VueComponent,
      },
      render: (h) => h(VueComponent),
    };
    static config = { name: 'Foo', refs: ['vue'] };
  }

  const tpl = html`<div>
    <div data-ref="vue"></div>
  </div>`;
  const foo = new Foo(tpl);

  it('should instantiate the vue component', () => {
    expect(foo.$vue._isVue).toBe(true);
    expect(tpl.innerHTML).toMatchSnapshot();
  });

  it('should mount the vue component', () => {
    foo.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith('mounted');
    expect(tpl.innerHTML).toMatchSnapshot();
  });

  it('should destroy the vue component', () => {
    foo.$destroy();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('destroyed');
    expect(tpl.innerHTML).toMatchSnapshot();
  });

  class Bar extends withVue(Base) {
    static config = { name: 'Bar', refs: ['vue'] };
  }

  it('should return an error about the missing vueConfig', () => {
    expect(() => { new Bar(tpl); }).toThrow('[withVue] You must define a `vueConfig` object.');
  });

  class FooBar extends withVue(Base) {
    static vueConfig = {
      components: {
        VueComponent,
      },
      render: '',
    };
    static config = { name: 'FooBar', refs: ['vue'] };
  }

  it('should return an error because `render` is not a function', () => {
    expect(() => { new FooBar(tpl); }).toThrow('[withVue] You must define a `render` function in vueConfig.');
  });
});
