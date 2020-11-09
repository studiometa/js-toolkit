import Base from '~/abstracts/Base';
import { scopeSelectorPonyfill } from '~/abstracts/Base/refs';

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
    get config() {
      return {
        name: 'Component',
      };
    }
  }

  class App extends Base {
    get config() {
      return {
        name: 'App',
        components: { Component },
      };
    }
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
      <div data-ref="foo"></div>
      <div data-component="Child">
        <div data-ref="bar"></div>
      </div>
    `;
    const app = new App(div);
    expect(Object.keys(app.$refs)).not.toEqual(['foo', 'bar']);
  });
});
