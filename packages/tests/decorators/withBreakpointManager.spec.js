import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';
import withBreakpointManager from '@studiometa/js-toolkit/decorators/withBreakpointManager';
import resizeWindow from '../__utils__/resizeWindow';

const withName = (BaseClass, name) =>
  class extends BaseClass {
    static config = { name };
  };

async function setupTest() {
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

  await resizeWindow({ width: 800 });
  const app = new App(document.body).$mount();
  const foo = document.querySelector('[data-component="Foo"]').__base__;

  return { app, foo, fn };
}

describe('The withBreakpointManager decorator', () => {
  it('should mount', async () => {
    const { app, foo, fn } = await setupTest();
    expect(app.$isMounted).toBe(true);
    expect(foo.$isMounted).toBe(true);
    expect(fn).toHaveBeenLastCalledWith('Foo', 'mounted');
  });

  it('should mount and destroy components', async () => {
    const { app, foo, fn } = await setupTest();
    await resizeWindow({ width: 1200 });
    expect(fn).toHaveBeenLastCalledWith('FooDesktop', 'mounted');
    fn.mockReset();
    await resizeWindow({ width: 400 });
    expect(fn).toHaveBeenNthCalledWith(1, 'FooDesktop', 'destroyed');
    expect(fn).toHaveBeenNthCalledWith(2, 'FooMobile', 'mounted');
    fn.mockReset();
    await resizeWindow({ width: 800 });
    expect(fn).toHaveBeenLastCalledWith('FooMobile', 'destroyed');
    fn.mockReset();

    await resizeWindow({ width: 1200 });
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
