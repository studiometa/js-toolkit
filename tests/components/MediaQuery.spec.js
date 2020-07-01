/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import MediaQuery from '../../src/components/MediaQuery';
import Base from '../../src/abstracts/Base';
import useResize from '../../src/services/resize';

class Foo extends Base {
  get config() {
    return {
      name: 'Foo',
    };
  }
}

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Foo,
        MediaQuery,
      },
    };
  }
}

const resizeWindow = (x, y) => {
  window.innerWidth = x;
  window.innerHeight = y;
  window.dispatchEvent(new Event('resize'));
  return new Promise(resolve => setTimeout(resolve, 400));
};

const template = `
  <div data-breakpoint>
    <div data-component="MediaQuery" data-active-breakpoints="m l">
      <div data-component="Foo">
      </div>
    </div>
  </div>
`;

describe('The MediaQuery component', () => {
  let app;

  beforeEach(() => {
    document.body.innerHTML = template;
  });

  it('should find the child component', () => {
    app = new App(document.body);
    expect(app.$children.MediaQuery[0].child).toBe(app.$children.Foo[0]);
  });

  it('should fail silently when the child component can not be found', async () => {
    await resizeWindow(1200, 800);
    app = new App(document.body);
    document.body.appendChild(app.$children.Foo[0].$el);
    await resizeWindow(600, 800);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
  });

  it('should always have an array for the `activeBreakpoints` getter', async () => {
    await resizeWindow(1200, 800);
    app = new App(document.body);
    app.$children.MediaQuery[0].$el.removeAttribute('data-active-breakpoints');
    expect(app.$children.MediaQuery[0].activeBreakpoints).toEqual([]);
  });

  it('should mount the child component when one of the available breakpoints is active', async () => {
    await resizeWindow(1200, 800);
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
  });

  it('should not mount the child component when none of the available breakpoints are active', async () => {
    await resizeWindow(600, 800);
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(false);
  });

  it('should toggle the child component on resize', async () => {
    await resizeWindow(1200, 800);
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
    await resizeWindow(600, 800);
    expect(app.$children.Foo[0].$isMounted).toBe(false);
    await resizeWindow(800, 800);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
  });
});
