import { jest } from '@jest/globals';
import { Base, withBreakpointObserver } from '@studiometa/js-toolkit';
import resizeWindow from '../__utils__/resizeWindow.js';
import { matchMedia } from '../__utils__/matchMedia.js';

matchMedia.useMediaQuery('(min-width: 80rem)');

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
  afterEach(() => {
    matchMedia.clear();
  });

  beforeEach(() => {
    document.body.innerHTML = template;
    app = new App(document.body).$mount();
    [foo] = app.$children.Foo;
    fooResponsive = app.$children.FooResponsive;
  });

  it('should mount', async () => {
    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fooResponsive[0].$isMounted).toBe(true);
  });

  it('should disable the decorated component', async () => {
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(window.innerWidth).toBe(768);
    expect(fooResponsive[0].$isMounted).toBe(true);
    expect(fooResponsive[1].$isMounted).toBe(true);
    expect(fooResponsive[2].$isMounted).toBe(false);
    expect(fooResponsive[3].$isMounted).toBe(false);
    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });

    expect(window.innerWidth).toBe(1280);
    expect(fooResponsive[0].$isMounted).toBe(true);
    expect(fooResponsive[1].$isMounted).toBe(false);
    expect(fooResponsive[2].$isMounted).toBe(true);
    expect(fooResponsive[3].$isMounted).toBe(false);

    fooResponsive[0].$options.inactiveBreakpoints = 's m';

    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(window.innerWidth).toBe(768);
    expect(fooResponsive[0].$isMounted).toBe(false);

    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    expect(fooResponsive[0].$isMounted).toBe(true);
  });

  it('should re-mount component when deleting both breakpoint options', async () => {
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(fooResponsive[1].$isMounted).toBe(true);
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });

    expect(fooResponsive[1].$isMounted).toBe(false);
    delete fooResponsive[1].$el.dataset.optionActiveBreakpoints;
    delete fooResponsive[1].$el.dataset.optionInActiveBreakpoints;
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(fooResponsive[1].$isMounted).toBe(true);
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

  it('should destroy components before mounting the others', async () => {
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

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

    class App1 extends Base {
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

    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });
    new App1(document.body).$mount();
    expect(fn).toHaveBeenCalledWith('Desktop', 'mounted');
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(fn).toHaveBeenNthCalledWith(2, 'Desktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(3, 'Mobile', 'mounted');
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });

    expect(fn).toHaveBeenNthCalledWith(4, 'Mobile', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(5, 'Desktop', 'mounted');
  });
});
