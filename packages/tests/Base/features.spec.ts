import { describe, it, expect } from 'vitest';
import { Base } from '@studiometa/js-toolkit';
import { h, mockFeatures } from '#test-utils';

describe('The configurable features', () => {
  it('should allow configuration of different attributes', async () => {
    const attributesDefintions = [
      {
        component: 'x',
        option: 'x',
        ref: 'x-ref',
      },
      {
        component: 'tk-is',
        option: 'tk-opt',
        ref: 'tk-ref',
      },
    ];

    for (const attributes of attributesDefintions) {
      const { unmock } = mockFeatures({ attributes });

      const component = h('div', { id: 'component', [attributes.component]: 'Foo' });
      const ref = h('div', { id: 'btn', [attributes.ref]: 'btn' });
      const div = h('div', { [`${attributes.option}-foo`]: 'foo' }, [component, ref]);

      class Foo extends Base {
        static config = {
          name: 'Foo',
        };
      }

      interface AppProps {
        $refs: {
          btn: HTMLElement;
        };
        $children: {
          Foo: Foo[];
        };
        $options: {
          foo: string;
        };
      }

      class App extends Base<AppProps> {
        static config = {
          name: 'App',
          refs: ['btn'],
          options: { foo: String },
          components: {
            Foo,
          },
        };
      }

      const app = new App(div);
      await app.$mount();
      expect(app.$options.foo).toBe(div.getAttribute(`${attributes.option}-foo`));
      expect(app.$refs.btn).toBe(ref);
      expect(app.$children.Foo[0].$el).toBe(component);
      unmock();
    }
  });
});
