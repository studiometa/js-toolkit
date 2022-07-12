/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';
import { html } from 'htl';
import ChildrenManager from '@studiometa/js-toolkit/Base/managers/ChildrenManager';
import OptionsManager from '@studiometa/js-toolkit/Base/managers/OptionsManager';
import RefsManager from '@studiometa/js-toolkit/Base/managers/RefsManager';
import wait from '../__utils__/wait';

describe('The abstract Base class', () => {
  it('must be extended', () => {
    expect(() => {
      new Base(document.createElement('div'));
    }).toThrow();
  });

  it('should throw an error when extended without proper configuration', () => {
    expect(() => {
      // @ts-ignore
      class Foo extends Base {
        static config = {};
      }
      new Foo(document.createElement('div'));
    }).toThrow('The `config.name` property is required.');
  });

  it('should throw an error if instantiated without a root element.', () => {
    expect(() => {
      class Foo extends Base {
        static config = {
          name: 'Foo',
        };
      }
      // @ts-ignore
      new Foo();
    }).toThrow('The root element must be defined.');
  });
});

describe('A Base instance', () => {
  class Foo extends Base {
    static config = {
      name: 'Foo',
    };
  }
  const element = document.createElement('div');
  const foo = new Foo(element).$mount();

  it('should have an `$id` property', () => {
    expect(foo.$id).toBeDefined();
  });

  it('should have an `$isMounted` property', () => {
    expect(foo.$isMounted).toBe(true);
  });

  it('should have a `$refs` property', () => {
    expect(foo.$refs).toBeInstanceOf(RefsManager);
  });

  it('should have a `$children` property', () => {
    expect(foo.$children).toBeInstanceOf(ChildrenManager);
  });

  it('should have an `$options` property', () => {
    expect(foo.$options).toBeInstanceOf(OptionsManager);
    expect(foo.$options.name).toBe('Foo');
  });

  it('should be able to set any `$options` property', () => {
    foo.$options.log = true;
    expect(foo.$options.log).toBe(true);
  });

  it('should have an `$el` property', () => {
    expect(foo.$el).toBe(element);
  });

  it('should have a `__base__` property', () => {
    // @ts-ignore
    expect(foo.$el.__base__).toBeInstanceOf(WeakMap);
    expect(foo.$el.__base__.get(Foo)).toBe(foo);
  });

  it('should inherit from parent config', () => {
    class A extends Base {
      static config = {
        name: 'A',
        log: true,
      };
    }

    class B extends A {
      static config = {
        name: 'B',
        options: {
          title: String,
          color: String,
        },
      };
    }

    class C extends B {
      static config = {
        name: 'C',
        options: {
          color: Boolean,
        },
      };
    }

    class D extends C {
      static config = {
        name: 'D',
        log: false,
      };
    }

    const d = new D(document.createElement('div'));
    expect(d.__config).toMatchSnapshot();
  });

  it('should have a `$root` property', () => {
    class ChildComponent extends Base {
      static config = {
        name: 'ChildComponent',
      };
    }

    class Component extends Base {
      static config = {
        name: 'Component',
        components: { ChildComponent },
      };
    }

    class App extends Base {
      static config = {
        name: 'App',
        components: { Component },
      };
    }

    const tpl = html`<div>
      <div data-component="Component">
        <div data-component="ChildComponent"></div>
      </div>
    </div>`;
    const app = new App(tpl).$mount();

    expect(app.$root).toBe(app);
    expect(app.$children.Component[0].$root).toBe(app);
    expect(app.$children.Component[0].$children.ChildComponent[0].$root).toBe(app);
  });
});

describe('A Base instance methods', () => {
  class Foo extends Base {
    static config = {
      name: 'Foo',
    };
  }

  let element;
  let foo;

  beforeEach(() => {
    element = document.createElement('div');
    foo = new Foo(element).$mount();
  });

  it('should emit a mounted event', () => {
    const fn = jest.fn();
    foo.$on('mounted', fn);
    foo.$destroy();
    foo.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should emit a destroyed event', () => {
    const fn = jest.fn();
    foo.$on('destroyed', fn);
    foo.$destroy();
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should be able to update its child components.', async () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
    `;

    const fn = jest.fn();
    class Bar extends Foo {}
    class Baz extends Base {
      static config = { name: 'Baz' };
      updated() {
        fn(this.$id);
      }
    }

    class AsyncBaz extends Baz {
      static config = {
        name: 'AsyncBaz',
      };
    }

    class App extends Base {
      static config = {
        name: 'App',
        components: {
          Bar,
          Baz,
          AsyncBaz: () => Promise.resolve(AsyncBaz),
        },
      };
    }

    const app = new App(div).$mount();
    expect(app.$children.Bar).toHaveLength(2);
    expect(app.$children.Bar[0].$isMounted).toBe(true);
    div.innerHTML = `
      <div data-component="Baz"></div>
      <div data-component="Baz"></div>
      <div data-component="AsyncBaz"></div>
    `;

    app.$update();

    expect(app.$children.Bar).toEqual([]);
    expect(app.$children.Baz).toHaveLength(2);
    expect(app.$children.Baz[0].$isMounted).toBe(true);
    const asyncBaz = await app.$children.AsyncBaz[0];
    expect(asyncBaz.$isMounted).toBe(true);

    const id = div.firstElementChild.__base__.get(Baz).$id;
    expect(id).toBe(app.$children.Baz[0].$id);

    const child = document.createElement('div');
    child.setAttribute('data-component', 'Baz');
    div.appendChild(child);
    expect(id).toBe(app.$children.Baz[0].$id);

    app.$update();

    // Wait for the async component to update
    await wait(1);
    expect(id).toBe(app.$children.Baz[0].$id);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should implement the $factory method', () => {
    class Bar extends Foo {}
    class Baz extends Foo {}
    class Boz extends Foo {}
    document.body.innerHTML = `
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
      <div class="custom-selector"></div>
      <div class="custom-selector"></div>
    `;

    const barInstances = Bar.$factory('Bar');
    const bazInstances = Baz.$factory('.custom-selector');
    const bozInstances = Boz.$factory('Boz');
    expect(barInstances).toHaveLength(2);
    expect(barInstances[0] instanceof Bar).toBe(true);
    expect(bazInstances).toHaveLength(2);
    expect(bazInstances[0] instanceof Baz).toBe(true);
    expect(bozInstances).toHaveLength(0);
    expect(Baz.$factory).toThrow(/\$factory method/);
  });

  it('should be able to be terminated', () => {
    const fn = jest.fn();
    class Bar extends Foo {
      terminated() {
        fn('method');
      }
    }

    const div = document.createElement('div');
    const bar = new Bar(div).$mount();
    expect(bar).toEqual(div.__base__.get(Bar));
    bar.$on('terminated', () => fn('event'));
    bar.$terminate();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'event');
    expect(fn).toHaveBeenNthCalledWith(2, 'method');
  });

  it('should not find children if none provided', () => {
    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    class Baz extends Base {
      static config = {
        name: 'Baz',
        components: { Bar },
      };
    }
    expect(foo.$children.registeredNames).toEqual([]);
    expect(new Baz(document.createElement('div')).$mount().$children.Bar).toEqual([]);
  });

  it('should not find terminated children', () => {
    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }

    class Baz extends Base {
      static config = {
        name: 'Baz',
        components: { Bar },
      };
    }

    const div = document.createElement('div');
    div.innerHTML = `
      <div data-component="Bar"></div>
    `;
    const baz = new Baz(div).$mount();
    expect(baz.$children.Bar).toEqual([div.firstElementChild.__base__.get(Bar)]);
    div.firstElementChild.__base__.get(Bar).$terminate();
    expect(baz.$children.Bar).toEqual([]);
  });

  it('should listen to the window.onload event', () => {
    const fn = jest.fn();
    class Bar extends Foo {
      loaded() {
        fn();
      }
    }

    const bar = new Bar(document.createElement('div')).$mount();
    window.dispatchEvent(new CustomEvent('load'));
    expect(fn).toHaveBeenCalledTimes(1);
    bar.$destroy();
    window.dispatchEvent(new CustomEvent('load'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should mount and destroy its children', () => {
    class Bar extends Base {
      static config = {
        name: 'Bar',
      };
    }
    class Baz extends Foo {
      static config = {
        name: 'Baz',
        components: { Bar },
      };
    }

    document.body.innerHTML = `<div data-component="Bar"></div>`;
    const baz = new Baz(document.body).$mount();
    const barElement = document.querySelector('[data-component="Bar"]');
    expect(baz.$isMounted).toBe(true);
    expect(barElement.__base__.get(Bar).$isMounted).toBe(true);
    baz.$destroy();
    expect(baz.$isMounted).toBe(false);
    expect(barElement.__base__.get(Bar).$isMounted).toBe(false);
  });
});

describe('The Base class event methods', () => {
  it('should bind handlers to events', () => {
    class App extends Base {
      static config = {
        name: 'A',
        emits: ['foo'],
      };
    }

    const app = new App(document.createElement('div')).$mount();
    const fn = jest.fn();
    const off = app.$on('foo', fn);
    app.$emit('foo', { foo: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'foo', detail: [{ foo: true }] })
    );
    off();
    app.$emit('foo', { foo: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should store event handlers', () => {
    class App extends Base {
      static config = { name: 'App', emits: ['event'] };
    }

    const app = new App(document.createElement('div')).$mount();
    const fn = jest.fn();
    app.$on('event', fn);
    expect(app.__hasEvent('event')).toBe(true);
    expect(app.__eventHandlers.get('event')).toEqual(new Set([fn]));
    app.$off('event', fn);
    expect(app.__eventHandlers.get('event')).toEqual(new Set());
  });

  it('should warn when an event is not configured', () => {
    class App extends Base {
      static config = { name: 'App' };
    }

    const app = new App(document.createElement('div')).$mount();
    const warnMock = jest.spyOn(console, 'warn');
    warnMock.mockImplementation(() => undefined);
    app.$on('other-event');
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });
});

describe('A Base instance config', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should have a working $log method when active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: true,
      };
    }
    const spy = jest.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const foo = new Foo(element).$mount();
    expect(foo.$options.log).toBe(true);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledWith('[Foo]', 'bar');
    spy.mockRestore();
  });

  it('should have a silent $log method when not active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: false,
      };
    }
    const spy = jest.spyOn(window.console, 'log');
    const foo = new Foo(element).$mount();
    expect(foo.$options.log).toBe(false);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('should have a working debug method when active in dev mode', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        debug: true,
      };
    }
    globalThis.__DEV__ = true;
    process.env.NODE_ENV = 'development';
    const spy = jest.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const div = document.createElement('div');
    const foo = new Foo(div).$mount();
    expect(spy.mock.calls).toMatchSnapshot();
    spy.mockRestore();
    process.env.NODE_ENV = 'test';
  });
});
