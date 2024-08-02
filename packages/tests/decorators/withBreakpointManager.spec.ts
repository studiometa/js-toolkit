import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Base,
  getInstanceFromElement,
  withBreakpointManager,
  withName,
} from '@studiometa/js-toolkit';
import type { Base as BaseType } from '@studiometa/js-toolkit';
import {
  useMatchMedia,
  resizeWindow,
  advanceTimersByTimeAsync,
} from '#test-utils';

async function getContext() {
  const matchMedia = useMatchMedia('(min-width: 64rem)');

  document.body.innerHTML = `
    <div data-breakpoint>
      <div data-component="Foo">
      </div>
    </div>
  `;
  const fn = vi.fn();
  const withMock = (BaseClass: typeof BaseType, name) =>
    withName(
      class extends BaseClass {
        mounted() {
          fn(name, 'mounted');
        }

        destroyed() {
          fn(name, 'destroyed');
        }
      },
      name,
    );
  class FooMobile extends withMock(Base, 'FooMobile') {}
  class FooDesktop extends withMock(Base, 'FooDesktop') {}
  class Foo extends withBreakpointManager(withMock(Base, 'Foo'), [
    ['s', FooMobile],
    ['l', FooDesktop],
  ]) {}

  class App extends Base {
    static config = {
      name: 'App',
      components: {
        Foo,
      },
    };
  }

  const app = new App(document.body)
  await app.$mount();
  const foo = getInstanceFromElement(document.querySelector('[data-component="Foo"]'), Foo);

  return { app, foo, fn, matchMedia };
}

describe('The withBreakpointManager decorator', () => {
  it('should mount', async () => {
    const { app, foo, fn } = await getContext();
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fn).toHaveBeenLastCalledWith('Foo', 'mounted');
  });

  it('should mount and destroy components', async () => {
    const { app, fn, matchMedia } = await getContext();
    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    expect(fn).toHaveBeenLastCalledWith('FooDesktop', 'mounted');
    fn.mockReset();
    matchMedia.useMediaQuery('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    expect(fn).toHaveBeenNthCalledWith(1, 'FooDesktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(2, 'FooMobile', 'mounted');
    fn.mockReset();
    matchMedia.useMediaQuery('(min-width: 64rem)');
    await resizeWindow({ width: 1024 });
    expect(fn).toHaveBeenLastCalledWith('FooMobile', 'destroyed');
    fn.mockReset();

    matchMedia.useMediaQuery('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    fn.mockReset();
    await app.$destroy();
    expect(fn).toHaveBeenNthCalledWith(1, 'FooDesktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(2, 'Foo', 'destroyed');
  });

  it('should throw error when not configured correctly', () => {
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class Bar extends withBreakpointManager(withName(Base, 'Bar'), {}) {}
    }).toThrowError(/must be an array/);
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      class Bar extends withBreakpointManager(withName(Base, 'Bar'), [[]]) {}
    }).toThrowError(/at least 2/);
  });
});
