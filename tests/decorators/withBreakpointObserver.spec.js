import Base from '~/abstracts/Base';
import withBreakpointObserver from '~/decorators/withBreakpointObserver';
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
  beforeEach(() => {
    document.body.innerHTML = template;
    app = new App(document.body);
    foo = document.querySelector('[data-component="Foo"]');
    fooResponsive = document.querySelectorAll('[data-component="FooResponsive"]');
  });

  it('should mount', async () => {
    await resizeWindow({ width: 1200 });
    expect(app.$isMounted).toBe(true);
    expect(foo.__base__.$isMounted).toBe(true);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
  });

  it('should disable the decorated component', async () => {
    await resizeWindow({ width: 480 });
    expect(window.innerWidth).toBe(480);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
    expect(fooResponsive[2].__base__.$isMounted).toBe(false);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);
    await resizeWindow({ width: 800 });
    expect(window.innerWidth).toBe(800);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    expect(fooResponsive[2].__base__.$isMounted).toBe(true);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);
    await resizeWindow({ width: 1200 });
    expect(window.innerWidth).toBe(1200);
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    expect(fooResponsive[2].__base__.$isMounted).toBe(true);
    expect(fooResponsive[3].__base__.$isMounted).toBe(false);

    fooResponsive[0].__base__.$options.inactiveBreakpoints = 's m';
    await resizeWindow({ width: 800 });
    expect(window.innerWidth).toBe(800);
    expect(fooResponsive[0].__base__.$isMounted).toBe(false);
    await resizeWindow({ width: 1200 });
    expect(fooResponsive[0].__base__.$isMounted).toBe(true);
  });

  it('should re-mount component when deleting both breakpoint options', async () => {
    await resizeWindow({ width: 400 });
    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
    await resizeWindow({ width: 800 });
    expect(fooResponsive[1].__base__.$isMounted).toBe(false);
    fooResponsive[1].dataset.options = '{}';
    await resizeWindow({ width: 400 });
    expect(fooResponsive[1].__base__.$isMounted).toBe(true);
  });

  it('should throw when configuring both breakpoint options', () => {
    expect(() => {
      class Bar extends withBreakpointObserver(Base) {
        static config = {
          name: 'Bar',
          activeBreakpoints: 's',
          inactiveBreakpoints: 'm',
        };
      }

      const div = document.createElement('div');
      // eslint-disable-next-line no-new
      new Bar(div);
    }).toThrow(/Incorrect configuration/);
  });

  it('should throw when breakpoints are not availabe', () => {
    expect(() => {
      document.body.innerHTML = '<div></div>';
      class Bar extends withBreakpointObserver(Base) {
        static config = {
          name: 'Bar',
          inactiveBreakpoints: 'm',
        };
      }

      // eslint-disable-next-line no-new
      new Bar(document.body);
    }).toThrow(/requires breakpoints/);
  });
});
