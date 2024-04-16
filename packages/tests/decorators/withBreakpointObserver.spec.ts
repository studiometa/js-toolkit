import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { Base, withBreakpointObserver, withName } from '@studiometa/js-toolkit';
import {
  advanceTimersByTimeAsync,
  h,
  resizeWindow,
  useFakeTimers,
  useMatchMedia,
  useRealTimers,
} from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

async function getContext() {
  class Foo extends withBreakpointObserver(withName(Base, 'Foo')) {}
  class FooResponsive extends withBreakpointObserver(withName(Base, 'FooResponsive')) {}

  class App extends Base<{
    $children: {
      Foo: Foo[];
      FooResponsive: FooResponsive[];
    };
  }> {
    static config = {
      name: 'App',
      components: {
        Foo,
        FooResponsive,
      },
    };
  }

  const root = h('div');
  root.innerHTML = `
    <div data-breakpoint>
      <div data-component="Foo"></div>
      <div data-component="FooResponsive"></div>
      <div data-component="FooResponsive" data-option-active-breakpoints="s"></div>
      <div data-component="FooResponsive" data-option-inactive-breakpoints="s"></div>
      <div data-component="FooResponsive" data-option-active-breakpoints="small"></div>
    </div>
  `;
  const app = new App(root);
  app.$mount();
  await advanceTimersByTimeAsync(1);
  const foo = app.$children.Foo[0];
  const fooResponsive = app.$children.FooResponsive;

  const matchMedia = useMatchMedia();

  return {
    root,
    app,
    foo,
    fooResponsive,
    matchMedia,
  };
}

describe('The withBreakpointObserver decorator', () => {
  it('should mount', async () => {
    const { app, foo, fooResponsive, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    await advanceTimersByTimeAsync(1);
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fooResponsive[0].$isMounted).toBe(true);
  });

  it('should disable the decorated component', async () => {
    const { fooResponsive, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await advanceTimersByTimeAsync(1);

    expect(window.innerWidth).toBe(768);
    expect(fooResponsive[0].$isMounted).toBe(true);
    expect(fooResponsive[1].$isMounted).toBe(true);
    expect(fooResponsive[2].$isMounted).toBe(false);
    expect(fooResponsive[3].$isMounted).toBe(false);
    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    await advanceTimersByTimeAsync(1);

    expect(window.innerWidth).toBe(1280);
    expect(fooResponsive[0].$isMounted).toBe(true);
    expect(fooResponsive[1].$isMounted).toBe(false);
    expect(fooResponsive[2].$isMounted).toBe(true);
    expect(fooResponsive[3].$isMounted).toBe(false);

    fooResponsive[0].$options.inactiveBreakpoints = 's m';

    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await advanceTimersByTimeAsync(1);

    expect(window.innerWidth).toBe(768);
    expect(fooResponsive[0].$isMounted).toBe(false);

    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    await advanceTimersByTimeAsync(1);
    expect(fooResponsive[0].$isMounted).toBe(true);
  });

  it('should re-mount component when deleting both breakpoint options', async () => {
    const { fooResponsive, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await advanceTimersByTimeAsync(1);

    expect(fooResponsive[1].$isMounted).toBe(true);
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });
    await advanceTimersByTimeAsync(1);

    expect(fooResponsive[1].$isMounted).toBe(false);
    delete fooResponsive[1].$el.dataset.optionActiveBreakpoints;
    delete fooResponsive[1].$el.dataset.optionInActiveBreakpoints;
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await advanceTimersByTimeAsync(1);

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
    const { root, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    const fn = mock();

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

    root.innerHTML = `
      <div data-breakpoint>
        <div data-component="Mobile"></div>
        <div data-component="Desktop"></div>
      </div>
    `;

    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });
    await advanceTimersByTimeAsync(1);
    new App1(root).$mount();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledWith('Desktop', 'mounted');
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await advanceTimersByTimeAsync(1);

    expect(fn).toHaveBeenNthCalledWith(2, 'Desktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(3, 'Mobile', 'mounted');
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });
    await advanceTimersByTimeAsync(1);

    expect(fn).toHaveBeenNthCalledWith(4, 'Mobile', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(5, 'Desktop', 'mounted');
  });
});
