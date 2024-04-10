import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { Base, withExtraConfig, importWhenPrefersMotion } from '@studiometa/js-toolkit';
import { matchMedia, useFakeTimers, useRealTimers, advanceTimersByTimeAsync, h } from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  matchMedia.clear();
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
    const fn = mock();
    const mediaQuery = 'not (prefers-reduced-motion)';
    matchMedia.useMediaQuery(mediaQuery);

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
    const fn = mock();
    const mediaQuery = '(prefers-reduced-motion)';
    matchMedia.useMediaQuery(mediaQuery);

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
