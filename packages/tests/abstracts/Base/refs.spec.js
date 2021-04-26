import { jest } from '@jest/globals';
import Base from '@studiometa/js-toolkit/abstracts/Base';
import { scopeSelectorPonyfill } from '@studiometa/js-toolkit/abstracts/Base/refs';

describe('The :scope pseudo-class ponyfill', () => {
  it('should find scoped elements', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div data-component>

          <div data-ref>
            <div data-component>
              <div data-child data-ref></div>
              <div data-child data-ref></div>
            </div>
          </div>

      </div>
    `;

    const root = div.querySelector('[data-component]');
    const children = Array.from(div.querySelectorAll('[data-child]'));

    const allRefs = Array.from(root.querySelectorAll('[data-ref]'));
    const childrenRefs = scopeSelectorPonyfill(root, '[data-component] [data-ref]');

    expect(childrenRefs).toEqual(children);
    expect(childrenRefs).not.toEqual(allRefs);
  });
});

describe('The refs resolution', () => {
  class Component extends Base {
    static config = {
      name: 'Component',
    };
  }

  class App extends Base {
    static config = {
      name: 'App',
      refs: ['foo', 'foo[]'],
      components: { Component },
    };
  }

  it('should resolve a component’s refs', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'foo');
    div.appendChild(ref);

    const app = new App(div);
    expect(app.$refs.foo).toBe(ref);
  });

  it('should emit an event when accessed', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'foo');
    div.appendChild(ref);

    const app = new App(div);
    const fn = jest.fn();
    app.$on('get:refs', fn);
    expect(app.$refs.foo).toBe(ref);
    expect(fn).toHaveBeenNthCalledWith(1, { foo: ref });
  });

  it('should parse ref as array when ending with `[]`', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'foo[]');
    div.appendChild(ref);

    const app = new App(div);
    expect(app.$refs.foo).toEqual([ref]);
  });

  it('should not resolve child components refs', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <div data-ref="foo"></div>
        <div data-component="Child">
          <div data-ref="bar"></div>
        </div>
      </div>
    `;
    const app = new App(div);
    expect(Object.keys(app.$refs)).not.toEqual(['foo', 'bar']);
  });

  it('should resolve child components refs when the :scope pseudo-class is not supported', () => {
    // eslint-disable-next-line no-underscore-dangle
    globalThis.__SCOPE_PSEUDO_CLASS_SHOULD_FAIL__ = true;
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <div data-ref="foo"></div>
        <div data-component="Child">
          <div data-ref="bar"></div>
        </div>
      </div>
    `;
    const app = new App(div);
    expect(Object.keys(app.$refs)).toEqual(['foo']);
    expect(Object.keys(app.$refs)).not.toEqual(['foo', 'bar']);
    // eslint-disable-next-line no-underscore-dangle
    globalThis.__SCOPE_PSEUDO_CLASS_SHOULD_FAIL__ = false;
  });

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

  it('should warn when using non-defined refs', () => {
    const div = document.createElement('div');
    div.innerHTML = `<div data-ref="baz"></div>`;
    const spy = jest.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    const app = new App(div).$mount();
    expect(spy).toHaveBeenCalledWith(
      '[App]',
      'The "baz" ref is not defined in the class configuration.',
      'Did you forgot to define it?'
    );
  });
});
