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

    expect(Component.$isBase).toBe(true);
    expect(Component.config).toEqual({ name: 'Component' });
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

  it('should look for an element', () => {
    document.body.innerHTML = `
      <div class="first"></div>
      <div class="second"></div>
    `;
    const [firstDiv, secondDiv] = Array.from(document.querySelectorAll('div'));
    const component = createBase('div', {
      config: { name: 'Component' },
    });

    expect(component.$el).toEqual(firstDiv);
    expect(component.$el).not.toEqual(secondDiv);
  });
});
