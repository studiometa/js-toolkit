import { jest } from '@jest/globals';
import defineComponent from '@studiometa/js-toolkit/helpers/defineComponent';

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
