import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Base,
  BaseConfig,
  BaseProps,
  getInstanceFromElement,
  registerComponent,
  withExtraConfig,
  withName,
} from '@studiometa/js-toolkit';
import { h, mount } from '#test-utils';

let mockedIsDev = true;

vi.mock(import('#private/utils/is.js'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    get isDev() {
      return mockedIsDev;
    },
  };
});

function mockIsDev(value: boolean) {
  const prev = mockedIsDev;
  mockedIsDev = value;

  return () => {
    mockedIsDev = prev;
  };
}

async function getContext() {
  class Foo<T extends BaseProps = BaseProps> extends Base<T> {
    static config: BaseConfig = {
      name: 'Foo',
    };
  }
  const element = h('div');
  const foo = new Foo(element);
  await foo.$mount();

  return { Foo, element, foo };
}

beforeEach(() => {
  globalThis['__JS_TOOLKIT_REGISTRY__'] = new Map();
});

describe('The abstract Base class', () => {
  it('must be extended', () => {
    expect(() => {
      new Base(document.createElement('div'));
    }).toThrow();
  });

  it('should throw an error when extended without proper configuration in dev mode', () => {
    expect(() => {
      // @ts-ignore
      class Foo extends Base {
        static config = {};
      }
      new Foo(document.createElement('div'));
    }).toThrow('The `config.name` property is required.');
  });

  it('should throw an error if instantiated without a root element in dev mode', () => {
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

  it('should fail silently in production mode', () => {
    const unmock = mockIsDev(false);

    class Foo extends Base {}

    const foo = new Foo(h('div'));
    expect(foo.$id).toBeUndefined();

    const foo2 = new Foo();
    expect(foo2.$id).toBeUndefined();

    unmock();
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

  it('should have a `$config` property', async () => {
    const { foo } = await getContext();
    expect(foo.$config).toEqual(foo.__config);
  });

  it('should have a `$refs` property', async () => {
    const { foo } = await getContext();
    expect(foo.$refs).toBe(foo.__refs.props);
  });

  it('should have a `$children` property', async () => {
    const { foo } = await getContext();
    expect(foo.$children).toBe(foo.__children.props);
  });

  it('should have an `$options` property', async () => {
    const { foo } = await getContext();
    expect(foo.$options).toBe(foo.__options.props);
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
    expect(foo.$el.__base__).toBeInstanceOf(Map);
    expect(foo.$el.__base__.get(Foo.config.name)).toBe(foo);
  });

  it('should inherit from parent config', () => {
    class A extends Base {
      static config: BaseConfig = {
        name: 'A',
        log: true,
      };
    }

    class B extends A {
      static config: BaseConfig = {
        name: 'B',
        options: {
          title: String,
          color: String,
        },
      };
    }

    class C extends B {
      static config: BaseConfig = {
        name: 'C',
        options: {
          color: Boolean,
        },
      };
    }

    class D extends C {
      static config: BaseConfig = {
        name: 'D',
        log: false,
      };
    }

    const d = new D(h('div'));
    expect(d.__config).toMatchSnapshot();
  });

  describe('The `$parent` getter', () => {
    it('should return null when no parent', async () => {
      class Component extends Base {
        static config: BaseConfig = {
          name: 'Component',
        };
      }

      const component = new Component(h('div'));
      await mount(component);
      expect(component.$parent).toBeNull();
    });

    it('should return the configured parent', async () => {
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

      const child = h('div', { dataComponent: 'ChildComponent' });
      const div = h('div', [child]);
      const component = new Component(div);
      await mount(component);

      const childComponent = getInstanceFromElement(child, ChildComponent);
      expect(childComponent.$parent).toBe(component);
    });

    it('should return the closest parent instance as $parent', async () => {
      class GrandChildComponent extends Base {
        static config: BaseConfig = {
          name: 'GrandChildComponent',
        };
      }

      class ChildComponent extends Base {
        static config: BaseConfig = {
          name: 'ChildComponent',
          components: {
            GrandChildComponent,
          },
        };
      }

      class Component extends Base<{ $children: { ChildComponent: ChildComponent[] } }> {
        static config: BaseConfig = {
          name: 'Component',
          components: {
            ChildComponent,
            GrandChildComponent,
          },
        };
      }

      const grandChild = h('div', { dataComponent: 'GrandChildComponent' });
      const child = h('div', { dataComponent: 'ChildComponent' }, [grandChild]);
      const div = h('div', [child]);
      const component = new Component(div);
      await mount(component);

      const childComponent = getInstanceFromElement(child, ChildComponent);
      const grandChildComponent = getInstanceFromElement(grandChild, GrandChildComponent);
      expect(childComponent.$parent?.$id).toBe(component.$id);
      expect(grandChildComponent.$parent?.$id).toBe(childComponent.$id);
    });

    it('should return the closest parent event if registered separately', async () => {
      class GrandChildComponent extends Base {
        static config: BaseConfig = {
          name: 'GrandChildComponent',
        };
      }

      class ChildComponent extends Base {
        static config: BaseConfig = {
          name: 'ChildComponent',
          components: {
            GrandChildComponent,
          },
        };
      }

      class Component extends Base<{ $children: { ChildComponent: ChildComponent[] } }> {
        static config: BaseConfig = {
          name: 'Component',
          components: {
            ChildComponent,
            GrandChildComponent,
          },
        };
      }

      const grandChild = h('div', { dataComponent: 'GrandChildComponent' });
      const child = h('div', { dataComponent: 'ChildComponent' }, [grandChild]);
      const div = h('div', { dataComponent: 'Component' }, [child]);
      document.body.append(div);
      const [childComponent] = await registerComponent(ChildComponent);
      const [component] = await registerComponent(Component);
      const [grandChildComponent] = await registerComponent(GrandChildComponent);

      expect(childComponent.$parent?.$id).toBe(component.$id);
      expect(grandChildComponent.$parent?.$id).toBe(childComponent.$id);
      div.remove();
    });

    it('should be resolved in a child `mounted` hook', async () => {
      let parent;
      class ChildComponent extends Base {
        static config: BaseConfig = {
          name: 'ChildComponent',
        };

        mounted() {
          parent = this.$parent;
        }
      }

      class Component extends Base<{ $children: { ChildComponent: ChildComponent[] } }> {
        static config: BaseConfig = {
          name: 'Component',
          components: { ChildComponent },
        };
      }

      const child = h('div', { dataComponent: 'ChildComponent' });
      const div = h('div', [child]);
      const component = new Component(div);
      await mount(component);

      expect(parent).toBe(component);
    });
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
    const app = new App(div);
    await app.$mount();
    expect(app.$root).toBe(app);
    expect(app.$children.Component[0].$root).toBe(app);
    expect(app.$children.Component[0].$children.ChildComponent[0].$root).toBe(app);
  });
});

describe('A Base instance methods', () => {
  it('should emit a mounted event', async () => {
    const { foo } = await getContext();
    const fn = vi.fn();
    foo.$on('mounted', fn);
    await foo.$destroy();
    await foo.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should emit a destroyed event', async () => {
    const { foo } = await getContext();
    const fn = vi.fn();
    foo.$on('destroyed', fn);
    await foo.$destroy();
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$destroy();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should be able to update its child components.', async () => {
    const { Foo } = await getContext();

    const div = h('div');
    div.innerHTML = `
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
    `;

    const fn = vi.fn();

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

    const app = new App(div);
    await app.$mount();
    expect(app.$children.Bar).toHaveLength(2);
    expect(app.$children.Bar[0].$isMounted).toBe(true);
    div.innerHTML = `
      <div data-component="Baz"></div>
      <div data-component="Baz"></div>
      <div data-component="AsyncBaz"></div>
    `;

    await app.$update();

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

    await app.$update();

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

    const fooInstances = await Promise.all(Bar.$register());
    const barInstances = await Promise.all(Bar.$register('Bar'));
    const bazInstances = await Promise.all(Baz.$register('.custom-selector'));
    const bozInstances = await Promise.all(Boz.$register('Boz'));

    expect(fooInstances).toHaveLength(1);
    expect(fooInstances[0].$el.dataset.component).toBe('Foo');
    expect(barInstances).toHaveLength(2);
    expect(barInstances[0] instanceof Bar).toBe(true);
    expect(bazInstances).toHaveLength(2);
    expect(bazInstances[0] instanceof Baz).toBe(true);
    expect(bozInstances).toHaveLength(0);
  });

  it('should be able to be terminated', async () => {
    const fn = vi.fn();

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
    await bar.$mount();
    expect(bar).toEqual(getInstanceFromElement(div, Bar));
    bar.$on('terminated', () => fn('event'));
    await bar.$terminate();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'event');
    expect(fn).toHaveBeenNthCalledWith(2, 'method');
  });

  it('should register itself on instantiation', async () => {
    const TestComponent = withName(Base, 'TestComponent');
    const registry = globalThis.__JS_TOOLKIT_REGISTRY__;
    const component = new TestComponent(h('div'));

    expect(registry.has('TestComponent')).toBe(true);
    expect(registry.get('TestComponent')).toBe(TestComponent);

    registry.delete('TestComponent');
  });

  it('should register sync configured children components on instantiation', async () => {
    const Child = withName(Base, 'Child');
    const Parent = withExtraConfig(Base, {
      name: 'Parent',
      components: {
        Child,
        div: Child,
        AsyncChild: () => new Promise(() => {}),
      },
    });

    const registry = globalThis.__JS_TOOLKIT_REGISTRY__;
    const component = new Parent(h('div'));

    // Check that it's in the registry
    expect(registry.has('Parent')).toBe(true);
    expect(registry.get('Parent')).toBe(Parent);

    expect(registry.has('Child')).toBe(true);
    expect(registry.get('Child')).toBe(Child);

    expect(registry.has('div')).toBe(true);
    expect(registry.get('div')).toBe(Child);

    expect(registry.has('AsyncChild')).toBe(false);
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

    expect(Object.keys(foo.$children)).toEqual([]);
    const baz = new Baz(h('div'));
    await baz.$mount();
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
    await baz.$mount();
    const bar = getInstanceFromElement(div.firstElementChild as HTMLElement, Bar);
    expect(baz.$children.Bar).toEqual([bar]);
    await bar.$terminate();
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
    await baz.$mount();
    const barElement = document.querySelector('[data-component="Bar"]') as HTMLElement;
    expect(baz.$isMounted).toBe(true);
    expect(getInstanceFromElement(barElement, Bar).$isMounted).toBe(true);
    await baz.$destroy();
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
    await app.$mount();
    const fn = vi.fn();
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
    await app.$mount();
    const fn = vi.fn();
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
    await app.$mount();
    const warnMock = vi.spyOn(console, 'warn');
    warnMock.mockImplementation(() => {});
    app.$on('other-event', () => {});
    expect(warnMock).toHaveBeenCalledTimes(1);
    warnMock.mockRestore();
  });
});

describe('A Base instance config', () => {
  it('should have a working $log method when active', async () => {
    const { Foo } = await getContext();
    Foo.config.log = true;

    const spy = vi.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const foo = new Foo(h('div'));
    expect(foo.$options.log).toBe(true);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledWith(`[${foo.$id}]`, 'bar');
    spy.mockRestore();
  });

  it('should have a silent $log method when not active', async () => {
    const { Foo } = await getContext();
    Foo.config.log = false;

    const spy = vi.spyOn(window.console, 'log');
    const foo = new Foo(h('div'));
    expect(foo.$options.log).toBe(false);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('should have a working $warn method when active', async () => {
    const { Foo } = await getContext();
    Foo.config.log = true;

    const spy = vi.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    const foo = new Foo(h('div'));
    expect(foo.$options.log).toBe(true);
    foo.$warn('bar');
    expect(spy).toHaveBeenCalledWith(`[${foo.$id}]`, 'bar');
    spy.mockRestore();
  });

  it('should have a silent $warn method when not active', async () => {
    const { Foo } = await getContext();
    Foo.config.log = false;

    const spy = vi.spyOn(window.console, 'warn');
    const foo = new Foo(h('div'));
    expect(foo.$options.log).toBe(false);
    foo.$warn('bar');
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('should have a working debug method when active in dev mode', async () => {
    const { Foo } = await getContext();
    Foo.config.debug = true;

    const devModeSpy = vi.spyOn(globalThis, '__DEV__', 'get');
    devModeSpy.mockImplementation(() => true);

    process.env.NODE_ENV = 'development';
    const spy = vi.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    new Foo(h('div'));
    for (const args of spy.mock.calls) {
      expect(args[0].startsWith('[debug] [Foo')).toBe(true);
    }
    spy.mockRestore();
    devModeSpy.mockRestore();
    process.env.NODE_ENV = 'test';
  });
});
