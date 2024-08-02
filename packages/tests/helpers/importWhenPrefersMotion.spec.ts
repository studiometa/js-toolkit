import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Base, withExtraConfig, importWhenPrefersMotion } from '@studiometa/js-toolkit';
import {
  useMatchMedia,
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
  h,
} from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

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
    app.$mount();
    await advanceTimersByTimeAsync(1);
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

    new AppOverride(div).$mount();
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
