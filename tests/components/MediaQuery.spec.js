import MediaQuery from '~/components/MediaQuery';
import Base from '~/abstracts/Base';
import resizeWindow from '../__utils__/resizeWindow';

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

  it('should always have an array for the `activeBreakpoints` getter', async () => {
    await resizeWindow({ width: 1200 });
    app = new App(document.body);
    app.$children.MediaQuery[0].$el.removeAttribute('data-active-breakpoints');
    expect(app.$children.MediaQuery[0].activeBreakpoints).toEqual([]);
  });

  it('should mount the child component when one of the available breakpoints is active', async () => {
    await resizeWindow({ width: 1200 });
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
  });

  it('should not mount the child component when none of the available breakpoints are active', async () => {
    await resizeWindow({ width: 600 });
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(false);
  });

  it('should toggle the child component on resize', async () => {
    await resizeWindow({ width: 1200 });
    app = new App(document.body);
    expect(app.$children.Foo[0].$isMounted).toBe(true);
    await resizeWindow({ width: 600 });
    expect(app.$children.Foo[0].$isMounted).toBe(false);
    await resizeWindow({ width: 800 });
    expect(app.$children.Foo[0].$isMounted).toBe(true);
  });

  it('should throw an error when the child component can not be found', async () => {
    await resizeWindow({ width: 1200 });
    app = new App(document.body);
    document.body.appendChild(app.$children.Foo[0].$el);

    expect(() => {
      app.$children.MediaQuery[0].test();
    }).toThrow();
  });
});
