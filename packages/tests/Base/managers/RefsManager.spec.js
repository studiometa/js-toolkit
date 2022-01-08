import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';

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
        <div data-component="Component">
          <div data-ref="bar[]"></div>
        </div>
      </div>
    `;
    const app = new App(div).$mount();
    expect(app.$refs.bar).toEqual([]);
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
});
