import { describe, it, expect, vi } from 'vitest';
import { Base, withBreakpointObserver, withName } from '@studiometa/js-toolkit';
import { h, resizeWindow, useMatchMedia } from '#test-utils';

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

  const matchMedia = useMatchMedia();
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

  await app.$mount();
  const foo = app.$children.Foo[0];
  const fooResponsive = app.$children.FooResponsive;

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
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fooResponsive[0].$isMounted).toBe(true);
  });

  it('should disable the decorated component', async () => {
    const { fooResponsive, matchMedia } = await getContext();
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
    const { fooResponsive, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(fooResponsive[1].$isMounted).toBe(true);
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });

    expect(fooResponsive[1].$isMounted).toBe(false);
    fooResponsive[1].$el.removeAttribute('data-option-active-breakpoints');
    fooResponsive[1].$el.removeAttribute('data-option-inactive-breakpoints');
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

      // eslint-disable-next-line no-new
      new Bar(h('div')).$mount();
    }).toThrowError(/Incorrect configuration/);
  });

  it('should destroy components before mounting the others', async () => {
    const { root, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    const fn = vi.fn();

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

    await new App1(root).$mount();
    expect(fn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Desktop",
          "mounted",
        ],
      ]
    `);
    fn.mockClear();

    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    expect(fn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Desktop",
          "destroyed",
        ],
        [
          "Mobile",
          "mounted",
        ],
      ]
    `);
    fn.mockClear();

    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });

    expect(fn.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "Mobile",
          "destroyed",
        ],
        [
          "Desktop",
          "mounted",
        ],
      ]
    `);
  });
});
