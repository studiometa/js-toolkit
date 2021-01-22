/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Base from '~/abstracts/Base';
import wait from '../../__utils__/wait';

describe('The abstract Base class', () => {
  it('must be extended', () => {
    expect(() => {
      new Base();
    }).toThrow();
  });

  it('should throw an error when extended without proper configuration', () => {
    expect(() => {
      class Foo extends Base {}
      new Foo(document.createElement('div'));
    }).toThrow('The `config` property must be defined.');

    expect(() => {
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
    expect(foo.$refs).toEqual({});
  });

  it('should have a `$children` property', () => {
    expect(foo.$children).toEqual({});
  });

  it('should have an `$options` property', () => {
    expect(foo.$options).not.toBeUndefined();
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
    expect(foo.$el.__base__).toBe(foo);
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

  it('should be able to update its child components.', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div data-component="Bar"></div>
      <div data-component="Bar"></div>
    `;

    class Bar extends Foo {}
    class Baz extends Foo {}

    class App extends Base {
      static config = {
        name: 'App',
        components: {
          Bar,
          Baz,
        },
      };
    }

    const app = new App(div).$mount();
    expect(app.$children.Bar).toHaveLength(2);
    expect(app.$children.Bar[0].$isMounted).toBe(true);
    div.innerHTML = `
      <div data-component="Baz"></div>
      <div data-component="Baz"></div>
    `;

    app.$update();

    expect(app.$children.Bar).toBeUndefined();
    expect(app.$children.Baz).toHaveLength(2);
    expect(app.$children.Baz[0].$isMounted).toBe(true);
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
    expect(bar).toEqual(div.__base__);
    bar.$on('terminated', () => fn('event'));
    bar.$terminate();
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'event');
    expect(fn).toHaveBeenNthCalledWith(2, 'method');
  });

  it('should bind methods to the root element', () => {
    const fn = jest.fn();
    class Bar extends Foo {
      onClick() {
        fn();
      }
    }

    const bar = new Bar(document.createElement('div')).$mount();
    bar.$el.click();
    expect(fn).toHaveBeenCalledTimes(1);
    bar.$destroy();
    bar.$el.click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should bind methods to refs and children', () => {
    const fn = jest.fn();

    class Baz extends Foo {
      onClick() {
        this.$emit('open', 'baz');
      }
    }

    class Bar extends Foo {
      static config = {
        ...(Foo.config || {}),
        refs: ['foo', 'baz'],
        components: {
          Baz,
        },
      };

      onFooClick() {
        fn();
      }

      onBazOpen(...args) {
        fn(...args);
      }

      onBazFocus() {
        fn('focus');
      }
    }

    const div = document.createElement('div');
    div.innerHTML = `
      <div data-ref="foo"></div>
      <div data-component="Baz"></div>
      <div data-ref="baz" data-component="Baz"></div>
    `;

    const bar = new Bar(div).$mount();
    div.querySelector('[data-ref="foo"]').click();
    expect(fn).toHaveBeenCalledTimes(1);
    div.querySelector('[data-component="Baz"]').click();
    expect(fn).toHaveBeenLastCalledWith('baz', 0);
    div.querySelector('[data-component="Baz"]').dispatchEvent(new CustomEvent('focus'));
    expect(fn).toHaveBeenLastCalledWith('baz', 0);
    expect(fn).toHaveBeenCalledTimes(2);
    div.querySelector('[data-ref="baz"]').dispatchEvent(new CustomEvent('focus'));
    expect(fn).toHaveBeenLastCalledWith('focus');
    expect(fn).toHaveBeenCalledTimes(3);
    bar.$destroy();
    div.querySelector('[data-component="Baz"]').click();
    div.querySelector('[data-component="Baz"]').dispatchEvent(new CustomEvent('focus'));
    expect(fn).toHaveBeenCalledTimes(3);
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
    expect(foo.$children).toEqual({});
    expect(new Baz(document.createElement('div')).$mount().$children).toEqual({});
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
    expect(baz.$children).toEqual({ Bar: [div.firstElementChild.__base__] });
    div.firstElementChild.__base__.$terminate();
    expect(baz.$children).toEqual({});
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
    expect(barElement.__base__.$isMounted).toBe(true);
    baz.$destroy();
    expect(baz.$isMounted).toBe(false);
    expect(barElement.__base__.$isMounted).toBe(false);

    const spy = jest.spyOn(baz, '$children', 'get');
    spy.mockImplementation(() => false);
    baz.$mount();
    expect(baz.$isMounted).toBe(true);
    expect(barElement.__base__.$isMounted).toBe(false);
    baz.$destroy();
    expect(baz.$isMounted).toBe(false);
    expect(barElement.__base__.$isMounted).toBe(false);
  });

  it('should resolve refs to children components', () => {
    class Bar extends Base {
      static config = {
        name: 'Bar',
        refs: ['bar'],
        components: { Foo },
      };
    }

    document.body.innerHTML = `<div data-component="Foo" data-ref="bar"></div>`;
    const bar = new Bar(document.body).$mount();
    expect(bar.$children.Foo[0]).toBe(bar.$refs.bar);
  });

  it('should cast single ref as array when ending with []', () => {
    class Bar extends Base {
      static config = {
        name: 'Bar',
        refs: ['btn', 'item[]', 'itemBis[]'],
      };
    }

    const div = document.createElement('div');
    div.innerHTML = `
      <button data-ref="btn"></button>
      <ul>
        <li data-ref="item[]"></li>
      </ul>
      <ul>
        <li data-ref="itemBis[]"></li>
        <li data-ref="itemBis[]"></li>
      </ul>
    `;

    const bar = new Bar(div).$mount();
    expect(bar.$refs.btn).toEqual(div.firstElementChild);
    expect(Array.isArray(bar.$refs.item)).toBe(true);
    expect(bar.$refs.item).toHaveLength(1);
    expect(bar.$refs.item[0]).toEqual(div.querySelector('[data-ref="item[]"]'));
    expect(Array.isArray(bar.$refs.itemBis)).toBe(true);
    expect(bar.$refs.itemBis).toHaveLength(2);
    expect(bar.$refs.itemBis[1]).toEqual(div.querySelector('[data-ref="itemBis[]"]:last-child'));
  });

  it('should resolve async components', async () => {
    const getFoo = jest.fn((resolve) => resolve(Foo));
    const getBaz = jest.fn((resolve) => resolve({ default: Foo }));
    const getBoz = jest.fn((resolve) => setTimeout(() => resolve(Foo), 100));
    const getBuz = jest.fn((resolve) => setTimeout(() => resolve(Foo), 200));

    class Bar extends Base {
      static config = {
        name: 'Bar',
        components: {
          Foo: () => new Promise(getFoo),
          Baz: () => new Promise(getBaz),
          Boz: () => new Promise(getBoz),
          Buz: () => new Promise(getBuz),
        },
      };
    }

    document.body.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Baz"></div>
      <div data-component="Boz"></div>
      <div data-component="Buz"></div>
    `;
    const bar = new Bar(document.body).$mount();
    expect(Object.keys(bar.$children)).toEqual(['Foo', 'Baz', 'Boz', 'Buz']);
    await wait(150);
    expect(bar.$children.Foo[0]).toBeInstanceOf(Base);
    expect(bar.$children.Buz[0]).toBeInstanceOf(Promise);
    bar.$destroy();
    await wait(200);
    expect(bar.$children.Buz[0].$isMounted).toBe(false);
  });

  it('should throw and error when `data-options` can not be parsed', () => {
    const spy = jest.spyOn(window.console, 'warn');
    spy.mockImplementation(() => true);
    document.body.dataset.options = 'foo-bar';
    expect(() => new Foo(document.body)).toThrow();
    spy.mockRestore();
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

  it('should have a working debug method when active', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        debug: true,
      };
    }
    const spy = jest.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const foo = new Foo(document.createElement('div')).$mount();
    expect(spy).toHaveBeenNthCalledWith(1, '[Foo]', 'constructor', foo);
    expect(spy).toHaveBeenNthCalledWith(2, '[Foo]', '$mount');
    expect(spy).toHaveBeenNthCalledWith(3, '[Foo]', 'callMethod', 'mounted');
    expect(spy).toHaveBeenNthCalledWith(4, '[Foo]', 'mountComponents', {});
    spy.mockRestore();
  });
});
