import { jest } from '@jest/globals';
import { html } from 'htl';
import { Base, withVue2 } from '@studiometa/js-toolkit';
import Vue from 'vue';

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

  class Foo extends withVue2(Base, Vue) {
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

  it('should return an error about the missing vueConfig', () => {
    class Bar extends withVue2(Base, Vue) {
      static config = { name: 'Bar', refs: ['vue'] };
    }
    expect(() => {
      new Bar(tpl);
    }).toThrow('[withVue] You must define a `vueConfig` object.');
  });

  it('should return an error because `render` is not a function', () => {
    class FooBar extends withVue2(Base, Vue) {
      static vueConfig = {
        components: {
          VueComponent,
        },
        render: '',
      };
      static config = { name: 'FooBar', refs: ['vue'] };
    }
    expect(() => {
      new FooBar(tpl);
    }).toThrow('[withVue] You must define a `render` function in vueConfig.');
  });

  // Jest fails to catch the error thrown inside the `mounted` event handle, making
  // this test always fail.
  // @todo mock something in order to catch the error anyway?
  // it("should return an error when the `vue` ref isn't a single HTMLElement", () => {
  //   const tplWithoutVueRef = html`<div></div>`;

  //   const secondFoo = new Foo(tplWithoutVueRef);
  //   expect(() => {
  //     secondFoo.$mount();
  //   }).toThrow('[withVue] The `vue` refs must be a single HTMLElement.');
  // });
});
