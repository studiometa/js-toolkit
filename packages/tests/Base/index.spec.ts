import { describe, it, expect, spyOn, mock, beforeEach, afterEach } from 'bun:test';
import { Base, BaseConfig, BaseProps, getInstanceFromElement } from '@studiometa/js-toolkit';
import { ChildrenManager, OptionsManager, RefsManager } from '#private/Base/managers/index.js';
import { h, useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from '#test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

async function getContext() {
  class Foo<T extends BaseProps = BaseProps> extends Base<T> {
    static config = {
      name: 'Foo',
    };
  }
  const element = h('div');
  const foo = new Foo(element).$mount();
  await advanceTimersByTimeAsync(1);

  return { Foo, element, foo };
}

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
  it('should have an `$id` property', async () => {
    const { foo } = await getContext();
    expect(foo.$id).toBeDefined();
  });

  it('should have an `$isMounted` property', async () => {
    const { foo } = await getContext();
    expect(foo.$isMounted).toBe(true);
  });

  it('should have a `$refs` property', async () => {
    const { foo } = await getContext();
    expect(foo.$refs).toBeInstanceOf(RefsManager);
  });

  it('should have a `$children` property', async () => {
    const { foo } = await getContext();
    expect(foo.$children).toBeInstanceOf(ChildrenManager);
  });

  it('should have an `$options` property', async () => {
    const { foo } = await getContext();
    expect(foo.$options).toBeInstanceOf(OptionsManager);
    expect(foo.$options.name).toBe('Foo');
  });

  it('should be able to set any `$options` property', async () => {
    const { foo } = await getContext();
    foo.$options.log = true;
    expect(foo.$options.log).toBe(true);
  });

  it('should have an `$el` property', async () => {
    const { foo, element } = await getContext();
    expect(foo.$el).toBe(element);
  });

  it('should have a `__base__` property', async () => {
    const { foo, Foo } = await getContext();
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

    const d = new D(h('div'));
    expect(d.__config).toMatchSnapshot();
  });

  it('should have a `$root` property', async () => {
    class ChildComponent extends Base {
      static config: BaseConfig = {
        name: 'ChildComponent',
      };
    }

    class Component extends Base<{ $children: { ChildComponent: ChildComponent[] } }> {
      static config: BaseConfig = {
        name: 'Component',
        components: { ChildComponent },
      };
    }

    class App extends Base<{ $children: { Component: Component[] } }> {
      static config: BaseConfig = {
        name: 'App',
        components: { Component },
      };
    }

    const div = h('div', {}, [
      h('div', { dataComponent: 'Component' }, [h('div', { dataComponent: 'ChildComponent' })]),
    ]);
    const app = new App(div).$mount();
    await advanceTimersByTimeAsync(1);
    expect(app.$root).toBe(app);
    expect(app.$children.Component[0].$root).toBe(app);
    expect(app.$children.Component[0].$children.ChildComponent[0].$root).toBe(app);
  });
});

describe('A Base instance methods', () => {
  it('should emit a mounted event', async () => {
    const { foo } = await getContext();
    const fn = mock();
    foo.$on('mounted', fn);
    foo.$destroy();
    await advanceTimersByTimeAsync(1);
    foo.$mount();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$mount();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should emit a destroyed event', async () => {
    const { foo } = await getContext();
    const fn = mock();
    foo.$on('destroyed', fn);
    foo.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should be able to update its child components.', async () => {
    const { Foo } = await getContext();

    const div = h('div');
    div.innerHTML = `
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
    `;

    const fn = mock();

    class Bar extends Foo {}
    class Baz extends Base {
      static config: BaseConfig = { name: 'Baz' };

      updated() {
        fn(this.$id);
      }
    }

    class AsyncBaz extends Baz {
      static config: BaseConfig = {
        name: 'AsyncBaz',
      };
    }

    class App extends Base<{
      $children: {
        Bar: Bar[];
        Baz: Baz[];
        AsyncBaz: Promise<AsyncBaz>[];
      };
    }> {
      static config: BaseConfig = {
        name: 'App',
        components: {
          Bar,
          Baz,
          AsyncBaz: () => Promise.resolve(AsyncBaz),
        },
      };
    }

    const app = new App(div).$mount();
    await advanceTimersByTimeAsync(1);
    expect(app.$children.Bar).toHaveLength(2);
    expect(app.$children.Bar[0].$isMounted).toBe(true);
    div.innerHTML = `
      <div data-component="Baz"></div>
      <div data-component="Baz"></div>
      <div data-component="AsyncBaz"></div>
    `;

    app.$update();
    await advanceTimersByTimeAsync(1);

    expect(app.$children.Bar).toEqual([]);
    expect(app.$children.Baz).toHaveLength(2);
    expect(app.$children.Baz[0].$isMounted).toBe(true);
    const asyncBaz = await app.$children.AsyncBaz[0];
    expect(asyncBaz.$isMounted).toBe(true);

    const id = getInstanceFromElement(div.firstElementChild as HTMLElement, Baz).$id;
    expect(id).toBe(app.$children.Baz[0].$id);

    const child = document.createElement('div');
    child.dataset.component = 'Baz';
    div.append(child);
    expect(id).toBe(app.$children.Baz[0].$id);

    app.$update();
    await advanceTimersByTimeAsync(1);

    expect(id).toBe(app.$children.Baz[0].$id);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should implement the $register method', async () => {
    const { Foo } = await getContext();

    class Bar extends Foo {}
    class Baz extends Foo {}
    class Boz extends Foo {}
    document.body.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
      <div class="custom-selector"></div>
      <div class="custom-selector"></div>
    `;

    const fooInstances = Bar.$register();
    const barInstances = Bar.$register('Bar');
    const bazInstances = Baz.$register('.custom-selector');
    const bozInstances = Boz.$register('Boz');
    await advanceTimersByTimeAsync(1);
    expect(fooInstances).toHaveLength(1);
    expect(fooInstances[0].$el.dataset.component).toBe('Foo');
    expect(barInstances).toHaveLength(2);
    expect(barInstances[0] instanceof Bar).toBe(true);
    expect(bazInstances).toHaveLength(2);
    expect(bazInstances[0] instanceof Baz).toBe(true);
    expect(bozInstances).toHaveLength(0);
  });

  it('should be able to be terminated', async () => {
    const fn = mock();

    class Bar extends Base {
      static config: BaseConfig = {
        name: 'Bar',
      };

      terminated() {
        fn('method');
      }
    }

    const div = h('div');
    const bar = new Bar(div);
    bar.$mount();
    await advanceTimersByTimeAsync(1);
    expect(bar).toEqual(getInstanceFromElement(div, Bar));
    bar.$on('terminated', () => fn('event'));
    bar.$terminate();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'event');
    expect(fn).toHaveBeenNthCalledWith(2, 'method');
  });

  it('should not find children if none provided', async () => {
    const { foo } = await getContext();

    class Bar extends Base {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }

    class Baz extends Base<{ $children: { Bar: Bar[] } }> {
      static config: BaseConfig = {
        name: 'Baz',
        components: { Bar },
      };
    }

    expect(foo.$children.registeredNames).toEqual([]);
    const baz = new Baz(h('div'));
    baz.$mount();
    await advanceTimersByTimeAsync(1);
    expect(baz.$children.Bar).toEqual([]);
  });

  it('should not find terminated children', async () => {
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

    const div = h('div');
    div.innerHTML = '<div data-component="Bar"></div>';

    const baz = new Baz(div);
    baz.$mount();
    await advanceTimersByTimeAsync(1);
    const bar = getInstanceFromElement(div.firstElementChild as HTMLElement, Bar);
    expect(baz.$children.Bar).toEqual([bar]);
    bar.$terminate();
    await advanceTimersByTimeAsync(1);
    expect(baz.$children.Bar).toEqual([]);
  });

  it('should mount and destroy its children', async () => {
    const { Foo } = await getContext();
    class Bar extends Base {
      static config: BaseConfig = {
        name: 'Bar',
      };
    }
    class Baz extends Foo<{ $children: { Bar: Bar[] } }> {
      static config: BaseConfig = {
        name: 'Baz',
        components: { Bar },
      };
    }

    document.body.innerHTML = '<div data-component="Bar"></div>';
    const baz = new Baz(document.body);
    baz.$mount();
    await advanceTimersByTimeAsync(1);
    const barElement = document.querySelector('[data-component="Bar"]') as HTMLElement;
    expect(baz.$isMounted).toBe(true);
    expect(getInstanceFromElement(barElement, Bar).$isMounted).toBe(true);
    baz.$destroy();
    await advanceTimersByTimeAsync(1);
    expect(baz.$isMounted).toBe(false);
    expect(getInstanceFromElement(barElement, Bar).$isMounted).toBe(false);
  });
});

describe('The Base class event methods', () => {
  it('should bind handlers to events', async () => {
    class App extends Base {
      static config: BaseConfig = {
        name: 'A',
        emits: ['foo'],
      };
    }

    const app = new App(document.createElement('div'));
    app.$mount();
    await advanceTimersByTimeAsync(1);
    const fn = mock();
    const off = app.$on('foo', fn);
    app.$emit('foo', { foo: true });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'foo', detail: [{ foo: true }] }),
    );
    off();
    app.$emit('foo', { foo: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should store event handlers', async () => {
    class App extends Base {
      static config = { name: 'App', emits: ['event'] };
    }

    const app = new App(h('div'));
    app.$mount();
    await advanceTimersByTimeAsync(1);
    const fn = mock();
    app.$on('event', fn);
    expect(app.__hasEvent('event')).toBe(true);
    expect(app.__eventHandlers.get('event')).toEqual(new Set([fn]));
    app.$off('event', fn);
    expect(app.__eventHandlers.get('event')).toEqual(new Set());
  });

  it('should warn when an event is not configured', async () => {
    class App extends Base {
      static config = { name: 'App' };
    }

    const app = new App(document.createElement('div'));
    app.$mount();
    await advanceTimersByTimeAsync(1);
    const warnMock = spyOn(console, 'warn');
    warnMock.mockImplementation(() => {});
    app.$on('other-event', () => {});
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });
});

describe('A Base instance config', () => {
  let element;

  beforeEach(() => {
    element = h('div');
  });

  it('should have a working $log method when active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: true,
      };
    }
    const spy = spyOn(window.console, 'log');
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
    const spy = spyOn(window.console, 'log');
    const foo = new Foo(element).$mount();
    expect(foo.$options.log).toBe(false);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('should have a working $warn method when active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: true,
      };
    }
    const spy = spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    const foo = new Foo(element).$mount();
    expect(foo.$options.log).toBe(true);
    foo.$warn('bar');
    expect(spy).toHaveBeenCalledWith('[Foo]', 'bar');
    spy.mockRestore();
  });

  it('should have a silent $warn method when not active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: false,
      };
    }
    const spy = spyOn(window.console, 'warn');
    const foo = new Foo(element).$mount();
    expect(foo.$options.log).toBe(false);
    foo.$warn('bar');
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
    const spy = spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const div = document.createElement('div');
    new Foo(div).$mount();
    for (const args of spy.mock.calls) {
      expect(args[0]).toStartWith('[debug] [Foo');
    }
    spy.mockRestore();
    process.env.NODE_ENV = 'test';
  });
});
