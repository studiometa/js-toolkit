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
    const bar = document.createElement('div');
    bar.setAttribute('data-ref', 'bar[]');
    div.appendChild(bar);
    const foo = document.createElement('div');
    foo.setAttribute('data-ref', 'foo');
    div.appendChild(foo);

    const app = new App(div).$mount();
    expect(app.$refs.bar).toEqual([bar]);
  });

  it('should not include single ref that were not found in the DOM', () => {
    const div = document.createElement('div');
    const ref = document.createElement('div');
    ref.setAttribute('data-ref', 'bar[]');
    div.appendChild(ref);

    const warnMock = jest.spyOn(console, 'warn');
    warnMock.mockImplementation(() => undefined);
    const app = new App(div).$mount();
    expect(app.$refs.foo).toBeUndefined();
    expect(warnMock).toHaveBeenCalled();
    warnMock.mockRestore();
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

  it('should resolve nested ref with component’s name prefix', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <div data-ref="foo"></div>
        <div data-component="Component">
          <div data-ref="App.bar[]"></div>
        </div>
      </div>
    `;
    const app = new App(div).$mount();
    expect(app.$refs.bar).toHaveLength(1);
  });

  it('should not resolve nested ref with component’s name prefix inside nested component', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div>
        <div data-ref="foo"></div>
        <div data-direct data-ref="bar[]"></div>
        <div data-direct data-prefixed data-ref="App.bar[]"></div>
        <div data-component="Component">
          <div data-prefixed data-ref="App.bar[]"></div>
          <div data-component="App">
            <div data-nested data-ref="App.bar[]"></div>
          </div>
        </div>
      </div>
    `;
    const app = new App(div).$mount();
    expect(app.$refs.bar).toHaveLength(3);
    expect(app.$refs.bar[0].dataset.direct).toBeDefined();
    expect(app.$refs.bar[1].dataset.direct).toBeDefined();
    expect(app.$refs.bar[1].dataset.prefixed).toBeDefined();
    expect(app.$refs.bar[2].dataset.prefixed).toBeDefined();
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
