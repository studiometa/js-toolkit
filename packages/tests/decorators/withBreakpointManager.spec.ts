/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect, jest, beforeEach, afterEach } from 'bun:test';
import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import { matchMedia } from '../__utils__/matchMedia.js';
import resizeWindow from '../__utils__/resizeWindow.js';

const withName = (BaseClass, name) =>
  class extends BaseClass {
    static config = { name };
  };

async function setupTest() {
  matchMedia.useMediaQuery('(min-width: 64rem)');

  document.body.innerHTML = `
    <div data-breakpoint>
      <div data-component="Foo">
      </div>
    </div>
  `;
  const fn = jest.fn();
  const withMock = (BaseClass, name) =>
    withName(
      class extends BaseClass {
        mounted() {
          fn(name, 'mounted');
        }

        destroyed() {
          fn(name, 'destroyed');
        }
      },
      name
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

  const app = new App(document.body).$mount();
  const foo = document.querySelector('[data-component="Foo"]').__base__.get(Foo);

  return { app, foo, fn };
}

describe('The withBreakpointManager decorator', () => {
  beforeEach(() => {
    matchMedia.useMediaQuery('(min-width: 1280px)');
  });

  afterEach(() => {
    matchMedia.clear();
  });

  it('should mount', async () => {
    const { app, foo, fn } = await setupTest();
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fn).toHaveBeenLastCalledWith('Foo', 'mounted');
  });

  it('should mount and destroy components', async () => {
    const { app, fn } = await setupTest();
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
    app.$destroy();
    expect(fn).toHaveBeenNthCalledWith(1, 'FooDesktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(2, 'Foo', 'destroyed');
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
});
