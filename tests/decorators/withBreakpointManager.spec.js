import Base from '~/abstracts/Base';
import withBreakpointManager from '~/decorators/withBreakpointManager';
import resizeWindow from '../__utils__/resizeWindow';

const fn = jest.fn();

const template = `
  <div data-breakpoint>
    <div data-component="Foo">
    </div>
  </div>
`;

document.body.innerHTML = template;

/**
 * With name decorator.
 * @param  {Base}   BaseClass A Base class to extend from
 * @param  {String} name      The name of the new class
 * @return {Base}             A class extending Base with a default config
 */
const withName = (BaseClass, name) =>
  class extends BaseClass {
    get config() {
      return {
        ...(super.config || {}),
        name,
      };
    }

    mounted() {
      fn(name, 'mounted');
    }

    destroyed() {
      fn(name, 'destroyed');
    }
  };
class FooMobile extends withName(Base, 'FooMobile') {}
class FooDesktop extends withName(Base, 'FooDesktop') {}

class Foo extends withBreakpointManager(withName(Base, 'Foo'), [
  ['s', FooMobile],
  ['l', FooDesktop],
]) {}

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Foo,
      },
    };
  }
}

describe('The withBreakpointManager decorator', () => {
  let app;
  let foo;
  beforeEach(async () => {
    if (app && app.$destroy) {
      app.$destroy();
    }
    await resizeWindow({ width: 800 });
    fn.mockReset();
    document.body.innerHTML = template;
    app = new App(document.body.firstElementChild);
    foo = document.querySelector('[data-component="Foo"]').__base__;
  });

  it('should mount', () => {
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fn).toHaveBeenLastCalledWith('Foo', 'mounted');
  });

  it('should mount and destroy components', async () => {
    await resizeWindow({ width: 1200 });
    expect(fn).toHaveBeenLastCalledWith('FooDesktop', 'mounted');
    fn.mockReset();
    await resizeWindow({ width: 400 });
    expect(fn).toHaveBeenNthCalledWith(1, 'FooMobile', 'mounted');
    expect(fn).toHaveBeenLastCalledWith('FooDesktop', 'destroyed');
    fn.mockReset();
    await resizeWindow({ width: 800 });
    expect(fn).toHaveBeenLastCalledWith('FooMobile', 'destroyed');
    fn.mockReset();

    await resizeWindow({ width: 1200 });
    fn.mockReset();
    app.$destroy();
    expect(fn).toHaveBeenNthCalledWith(1, 'FooDesktop', 'destroyed');
    expect(fn).toHaveBeenLastCalledWith('Foo', 'destroyed');
  });

  it('should throw error when not configured correctly', () => {
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class Bar extends withBreakpointManager(withName(Base, 'Bar'), {}) {}
    }).toThrow(/must be an array/);
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class Bar extends withBreakpointManager(withName(Base, 'Bar'), [[]]) {}
    }).toThrow(/at least 2/);
  });

  it('should throw when breakpoints are not availabe', () => {
    expect(() => {
      document.body.innerHTML = '<div></div>';
      // eslint-disable-next-line no-unused-vars
      class Boz extends withBreakpointManager(withName(Base, 'Boz'), [
        ['s', withName(Base, 'BozMobile')],
        ['l', withName(Base, 'BozDesktop')],
      ]) {}
    }).toThrow(/requires breakpoints/);
  });
});
