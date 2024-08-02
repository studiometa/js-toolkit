import { describe, it, expect } from 'vitest';
import { Base, createApp } from '@studiometa/js-toolkit';
import {
  h,
  mockFeatures,
  advanceTimersByTimeAsync,
  useFakeTimers,
  useRealTimers,
} from '#test-utils';

describe('The configurable features', () => {
  it('should allow configuration of different attributes', async () => {
    const { unmock } = mockFeatures({
      attributes: {
        component: 'tk-is',
        option: 'tk-opt',
        ref: 'tk-ref',
      },
    });

    const component = h('div', { id: 'component', tkIs: 'Foo' });
    const ref = h('div', { id: 'btn', tkRef: 'btn' });
    const div = h('div', { tkOptFoo: 'foo' }, [component, ref]);

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
    useFakeTimers();
    app.$mount();
    await advanceTimersByTimeAsync(100);
    useRealTimers();
    expect(app.$options.foo).toBe(div.getAttribute('tk-opt-foo'));
    expect(app.$refs.btn).toBe(ref);
    expect(app.$children.Foo[0].$el).toBe(component);
    unmock();
  });
});
