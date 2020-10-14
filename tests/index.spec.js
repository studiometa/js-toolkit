import { defineComponent, createBase } from '~/index';

describe('The `defineComponent` function', () => {
  it('should create a Base component', () => {
    const Component = defineComponent({
      config: {
        name: 'Component',
      },
      mounted() {},
      methods: {
        onClick() {},
      },
    });

    const OtherComponent = defineComponent({
      config: {
        name: 'OtherComponent',
      },
    });

    expect(Component.__isBase__).toBe(true);
    expect(Component.prototype.config).toEqual({ name: 'Component' });
    expect(Object.keys(Component.prototype)).toEqual(['onClick', 'mounted']);
    expect(Object.keys(OtherComponent.prototype)).toEqual([]);
  });

  it('should fail with malformed configuration', () => {
    expect(() => {
      defineComponent({});
    }).toThrow();

    expect(() => {
      defineComponent({ config: {} });
    }).toThrow();

    expect(() => {
      defineComponent({ config: { name: 'Component' }, foo() {} });
    }).toThrow('not a Base lifecycle hook');
  });
});

describe('The `createBase` function', () => {
  it('should create a component instance', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    const component = createBase(div, {
      config: { name: 'Component' },
      mounted() {
        fn('mounted');
      },
      methods: {
        onClick() {
          fn('clicked');
        },
      },
    });

    expect(component.$options.name).toBe('Component');
    expect(fn).toHaveBeenLastCalledWith('mounted');
    div.click();
    expect(fn).toHaveBeenLastCalledWith('clicked');
  });

  it('should create multiple component instances', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div></div>
      <div></div>
      <div></div>
    `;

    const components = createBase(div.querySelectorAll('div'), {
      config: { name: 'Component' },
    });

    expect(components).toHaveLength(3);
  });
});
