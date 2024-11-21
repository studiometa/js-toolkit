import { describe, it, expect, vi } from 'vitest';
import { Base, withExtraConfig, importWhenPrefersMotion } from '@studiometa/js-toolkit';
import { useMatchMedia, h } from '#test-utils';
import { wait } from '#private/utils';

class App extends Base {
  static config = {
    name: 'App',
  };
}

class Component extends Base {
  static config = {
    name: 'Component',
  };
}

describe('The `importWhenPrefersMotion` lazy import helper', () => {
  it('should import a component when user prefers motion', async () => {
    const fn = vi.fn();
    useMatchMedia('not (prefers-reduced-motion)');

    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importWhenPrefersMotion(() => {
            fn();
            return Promise.resolve(Component);
          }),
      },
    });

    const app = new AppOverride(div);
    await app.$mount();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(app.$children.Component).toHaveLength(1);
    expect(app.$children.Component[0]).toBeInstanceOf(Component);
  });

  it('should not import a component when user prefers reduced motion', async () => {
    const fn = vi.fn();
    useMatchMedia('(prefers-reduced-motion)');

    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importWhenPrefersMotion(() => {
            fn();
            return Promise.resolve(Component);
          }),
      },
    });

    await new AppOverride(div).$mount();
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
