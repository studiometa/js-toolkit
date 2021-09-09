import { jest } from '@jest/globals';
import Base from '@studiometa/js-toolkit';

describe('The refs resolution', () => {
  class Component extends Base {
    static config = {
      name: 'Component',
    };
  }

  class App extends Base {
    static config = {
      name: 'App',
      refs: ['foo', 'bar[]'],
      components: { Component },
    };
  }

  it('should resolve a component’s refs', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'foo');
    div.appendChild(ref);

    const app = new App(div).$mount();
    expect(app.$refs.foo).toBe(ref);
  });

  it('should emit an event when accessed', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'foo');
    div.appendChild(ref);

    const app = new App(div).$mount();
    const fn = jest.fn();
    app.$on('get:refs', fn);
    expect(app.$refs.foo).toBe(ref);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0].detail[0].foo).toBe(ref);
    expect(fn.mock.calls[0][0].detail[0].bar).toEqual([]);
  });

  it('should parse ref as array when ending with `[]`', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'bar[]');
    div.appendChild(ref);

    const app = new App(div).$mount();
    expect(app.$refs.bar).toEqual([ref]);
  });

  it('should not resolve child components refs', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <div data-ref="foo"></div>
        <div data-component="Child">
          <div data-ref="baz"></div>
        </div>
      </div>
    `;
    const app = new App(div);
    expect(app.$refs.baz).toBeUndefined();
  });

  // @todo Remove in v2
  // it('should resolve child components refs when the :scope pseudo-class is not supported', () => {
  //   // eslint-disable-next-line no-underscore-dangle
  //   globalThis.__SCOPE_PSEUDO_CLASS_SHOULD_FAIL__ = true;
  //   const div = document.createElement('div');
  //   div.innerHTML = `
  //     <div>
  //       <div data-ref="foo"></div>
  //       <div data-component="Child">
  //         <div data-ref="bar"></div>
  //       </div>
  //     </div>
  //   `;
  //   const app = new App(div);
  //   expect(Object.keys(app.$refs)).toEqual(['foo']);
  //   expect(Object.keys(app.$refs)).not.toEqual(['foo', 'bar']);
  //   // eslint-disable-next-line no-underscore-dangle
  //   globalThis.__SCOPE_PSEUDO_CLASS_SHOULD_FAIL__ = false;
  // });

  it('should be able to resolve multiple refs as array with a warning', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div data-ref="foo"></div>
      <div data-ref="foo"></div>
    `;
    const spy = jest.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    const app = new App(div).$mount();
    expect(spy).toHaveBeenCalledWith(
      '[App]',
      'The "foo" ref has been found multiple times.',
      'Did you forgot to add the `[]` suffix to its name?'
    );
  });

  // @todo remove in v2
  // it('should warn when using non-defined refs', () => {
  //   const div = document.createElement('div');
  //   div.innerHTML = `<div data-ref="baz"></div>`;
  //   const spy = jest.spyOn(window.console, 'warn');
  //   spy.mockImplementation(() => true);
  //   const app = new App(div).$mount();
  //   expect(spy).toHaveBeenCalledWith(
  //     '[App]',
  //     'The "baz" ref is not defined in the class configuration.',
  //     'Did you forgot to define it?'
  //   );
  // });
});
