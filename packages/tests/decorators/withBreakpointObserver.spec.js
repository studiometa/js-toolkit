import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver';
import useResize from '@studiometa/js-toolkit/services/resize.js';
import resizeWindow from '../__utils__/resizeWindow';

/**
 * With name decorator.
 * @param  {Base}   BaseClass A Base class to extend from
 * @param  {String} name      The name of the new class
 * @return {Base}             A class extending Base with a default config
 */
const withName = (BaseClass, name) =>
  class extends BaseClass {
    static config = {
      ...(BaseClass.config || {}),
      name,
    };
  };

class Foo extends withBreakpointObserver(withName(Base, 'Foo')) {}
class FooResponsive extends withBreakpointObserver(withName(Base, 'FooResponsive')) {}

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Foo,
      FooResponsive,
    },
  };
}

const template = `
  <div data-breakpoint>
    <div data-component="Foo"></div>
    <div data-component="FooResponsive"></div>
    <div data-component="FooResponsive" data-option-active-breakpoints="s"></div>
    <div data-component="FooResponsive" data-option-inactive-breakpoints="s"></div>
    <div data-component="FooResponsive" data-option-active-breakpoints="small"></div>
  </div>
`;

let app;
let foo;
let fooResponsive;

describe('The withBreakpointObserver decorator', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    document.body.innerHTML = template;
    app = new App(document.body).$mount();
    foo = document.querySelector('[data-component="Foo"]');
    fooResponsive = document.querySelectorAll('[data-component="FooResponsive"]');
  });

  it('should mount', () => {
    resizeWindow({ width: 1200 });
    jest.runAllTimers();
    expect(app.$isMounted).toBe(true);
    expect(foo.__base__.$isMounted).toBe(true);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
  });

  it('should disable the decorated component', async () => {
    resizeWindow({ width: 480 });
    jest.runAllTimers();

    expect(window.innerWidth).toBe(480);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
    expect(fooResponsive[2].__base__.$isMounted).toBe(false);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);
    resizeWindow({ width: 800 });
    jest.runAllTimers();

    expect(window.innerWidth).toBe(800);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    expect(fooResponsive[2].__base__.$isMounted).toBe(true);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);
    resizeWindow({ width: 1200 });
    jest.runAllTimers();

    expect(window.innerWidth).toBe(1200);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    expect(fooResponsive[2].__base__.$isMounted).toBe(true);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);

    fooResponsive[0].__base__.$options.inactiveBreakpoints = 's m';
    // We need the real timers to wait for the MutationObserver to work correctly.
    jest.useRealTimers();
    await resizeWindow({ width: 800 });

    expect(window.innerWidth).toBe(800);
    expect(fooResponsive[0].__base__.$isMounted).toBe(false);

    await resizeWindow({ width: 1200 });
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);

    jest.useFakeTimers();
  });

  it('should re-mount component when deleting both breakpoint options', () => {
    resizeWindow({ width: 400 });
    jest.runAllTimers();

    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
    resizeWindow({ width: 800 });
    jest.runAllTimers();

    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    fooResponsive[1].dataset.options = '{}';
    resizeWindow({ width: 400 });
    jest.runAllTimers();

    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
  });

  it('should throw when configuring both breakpoint options', () => {
    expect(() => {
      class Bar extends withBreakpointObserver(Base) {
        static config = {
          name: 'Bar',
          options: {
            activeBreakpoints: { type: String, default: 's' },
            inactiveBreakpoints: { type: String, default: 'm' },
          },
        };
      }

      const div = document.createElement('div');
      // eslint-disable-next-line no-new
      new Bar(div).$mount();
    }).toThrow(/Incorrect configuration/);
  });

  it('should destroy components before mounting the others', () => {
    resizeWindow({ width: 800 });
    jest.runAllTimers();

    const fn = jest.fn();

    class Mobile extends withBreakpointObserver(Base) {
      static config = {
        name: 'Mobile',
        options: {
          inactiveBreakpoints: { type: String, default: 'm' },
        },
      };

      mounted() {
        fn('Mobile', 'mounted');
      }

      destroyed() {
        fn('Mobile', 'destroyed');
      }
    }

    class Desktop extends withBreakpointObserver(Base) {
      static config = {
        name: 'Desktop',
        options: {
          activeBreakpoints: { type: String, default: 'm' },
        },
      };

      mounted() {
        fn('Desktop', 'mounted');
      }

      destroyed() {
        fn('Desktop', 'destroyed');
      }
    }

    class App extends Base {
      static config = {
        name: 'App',
        components: { Mobile, Desktop },
      };
    }

    document.body.innerHTML = `
      <div data-breakpoint>
        <div data-component="Mobile"></div>
        <div data-component="Desktop"></div>
      </div>
    `;

    const app = new App(document.body).$mount();
    expect(fn).toHaveBeenCalledWith('Desktop', 'mounted');
    resizeWindow({ width: 400 });
    jest.runAllTimers();

    expect(fn).toHaveBeenNthCalledWith(2, 'Desktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(3, 'Mobile', 'mounted');
    resizeWindow({ width: 800 });
    jest.runAllTimers();

    expect(fn).toHaveBeenNthCalledWith(4, 'Mobile', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(5, 'Desktop', 'mounted');
  });

  it('should throw when breakpoints are not availabe', () => {
    expect(() => {
      document.body.innerHTML = '<div></div>';
      class Bar extends withBreakpointObserver(Base) {
        static config = {
          name: 'Bar',
          options: {
            inactiveBreakpoints: { type: String, default: 'm' },
          },
        };
      }

      // eslint-disable-next-line no-new
      new Bar(document.body).$mount();
    }).toThrow(/requires breakpoints/);
  });
});
