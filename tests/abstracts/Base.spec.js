/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Base from '../../src/abstracts/Base';
import wait from '../__utils__/wait';

describe('The abstract Base class', () => {
  it('must be extended', () => {
    expect(() => {
      new Base();
    }).toThrow();
  });

  it('should throw an error when extended without proper configuration', () => {
    expect(() => {
      class Foo extends Base {}
      new Foo();
    }).toThrow('The `config` getter must be defined.');

    expect(() => {
      class Foo extends Base {
        get config() {
          return {};
        }
      }
      new Foo();
    }).toThrow('The `config.name` property is required.');
  });

  it('should throw an error if instantiated without a root element.', () => {
    expect(() => {
      class Foo extends Base {
        get config() {
          return { name: 'Foo' };
        }
      }
      new Foo();
    }).toThrow('The root element must be defined.');
  });
});

describe('A Base instance', () => {
  class Foo extends Base {
    get config() {
      return { name: 'Foo' };
    }
  }
  const element = document.createElement('div');
  const foo = new Foo(element);

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
    expect(foo.$options).toEqual({ name: 'Foo' });
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
    get config() {
      return { name: 'Foo' };
    }
  }

  let element;
  let foo;

  beforeEach(() => {
    element = document.createElement('div');
    foo = new Foo(element);
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

  it('should bind methods to the root element', () => {
    const fn = jest.fn();
    class Bar extends Foo {
      onClick() {
        fn();
      }
    }

    const bar = new Bar(document.createElement('div'));
    bar.$el.click();
    expect(fn).toHaveBeenCalledTimes(1);
    bar.$destroy();
    bar.$el.click();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should not find children if none provided', () => {
    class Bar extends Base {
      get config() {
        return { name: 'Bar' };
      }
    }

    class Baz extends Base {
      get config() {
        return { name: 'Baz', components: { Bar } };
      }
    }
    expect(foo.$children).toEqual({});
    expect(new Baz(document.createElement('div')).$children).toEqual({});
  });

  it('should listen to the window.onload event', () => {
    const fn = jest.fn();
    class Bar extends Foo {
      loaded() {
        fn();
      }
    }

    const bar = new Bar(document.createElement('div'));
    window.dispatchEvent(new CustomEvent('load'));
    expect(fn).toHaveBeenCalledTimes(1);
    bar.$destroy();
    window.dispatchEvent(new CustomEvent('load'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should mount and destroy its children', () => {
    class Bar extends Base {
      get config() {
        return { name: 'Bar' };
      }
    }
    class Baz extends Foo {
      get config() {
        return { name: 'Baz', components: { Bar } };
      }
    }

    document.body.innerHTML = `<div data-component="Bar"></div>`;
    const baz = new Baz(document.body);
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
      get config() {
        return { name: 'Bar', components: { Foo } };
      }
    }

    document.body.innerHTML = `<div data-component="Foo" data-ref="bar"></div>`;
    const bar = new Bar(document.body);
    expect(bar.$children.Foo[0]).toBe(bar.$refs.bar);
  });

  it('should resolve async components', async () => {
    const getFoo = jest.fn(resolve => resolve(Foo));
    const getBaz = jest.fn(resolve => resolve({ default: Foo }));
    const getBoz = jest.fn(resolve => setTimeout(() => resolve(Foo), 100));
    const getBuz = jest.fn(resolve => setTimeout(() => resolve(Foo), 200));

    class Bar extends Base {
      get config() {
        return {
          name: 'Bar',
          components: {
            Foo: () => new Promise(getFoo),
            Baz: () => new Promise(getBaz),
            Boz: () => new Promise(getBoz),
            Buz: () => new Promise(getBuz),
          },
        };
      }
    }

    document.body.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Baz"></div>
      <div data-component="Boz"></div>
      <div data-component="Buz"></div>
    `;
    const bar = new Bar(document.body);
    expect(Object.keys(bar.$children)).toEqual(['Foo', 'Baz', 'Boz', 'Buz']);
    await wait(150);
    /* eslint-disable no-underscore-dangle */
    expect(bar.$children.Foo[0].__isAsync__).toBeUndefined();
    expect(bar.$children.Buz[0].__isAsync__).toBe(true);
    /* eslint-enable no-underscore-dangle */
    bar.$destroy();
    await wait(200);
    expect(bar.$children.Buz[0].$isMounted).toBe(false);
  });

  it('should throw and error when `data-options` can not be parsed', () => {
    document.body.dataset.options = 'foo-bar';
    expect(() => new Foo(document.body)).toThrow();
  });
});

describe('A Base instance config', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('div');
  });

  it('should have a working $log method when active', () => {
    class Foo extends Base {
      get config() {
        return { name: 'Foo', log: true };
      }
    }
    const spy = jest.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const foo = new Foo(element);
    expect(foo.$options.log).toBe(true);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledWith('Foo', 'bar');
    spy.mockRestore();
  });

  it('should have a silent $log method when not active', () => {
    class Foo extends Base {
      get config() {
        return { name: 'Foo', log: false };
      }
    }
    const spy = jest.spyOn(window.console, 'log');
    const foo = new Foo(element);
    expect(foo.$options.log).toBe(false);
    foo.$log('bar');
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('should have a working debug method when active', () => {
    class Foo extends Base {
      get config() {
        return { name: 'Foo', debug: true };
      }
    }
    const spy = jest.spyOn(window.console, 'log');
    spy.mockImplementation(() => true);
    const foo = new Foo(document.createElement('div'));
    expect(spy).toHaveBeenNthCalledWith(1, foo.$options.name, 'constructor', foo);
    expect(spy).toHaveBeenNthCalledWith(2, foo.$options.name, '$mount');
    expect(spy).toHaveBeenNthCalledWith(3, foo.$options.name, 'call', 'mounted');
    spy.mockRestore();
  });
});
