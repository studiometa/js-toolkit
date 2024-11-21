import { describe, it, expect, vi } from 'vitest';
import {
  Base,
  withExtraConfig,
  importOnMediaQuery,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import { h, useMatchMedia } from '#test-utils';
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

describe('The `importOnMediaQuery` lazy import helper', () => {
  it('should import a component when user changes prefers motion media query', async () => {
    const fn = vi.fn();
    const mediaQuery = 'not (prefers-reduced-motion)';
    const matchMedia = useMatchMedia(mediaQuery);

    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnMediaQuery(() => {
            fn();
            return Promise.resolve(Component);
          }, mediaQuery),
      },
    });

    matchMedia.useMediaQuery('(prefers-reduced-motion)');
    await (new AppOverride(div)).$mount();
    expect(fn).not.toHaveBeenCalled();
    expect(getInstanceFromElement(component, Component)).toBeNull();
    matchMedia.useMediaQuery(mediaQuery);
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component when user prefers motion', async () => {
    const fn = vi.fn();
    const mediaQuery = 'not (prefers-reduced-motion)';
    useMatchMedia(mediaQuery);

    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnMediaQuery(() => {
            fn();
            return Promise.resolve(Component);
          }, mediaQuery),
      },
    });

    await (new AppOverride(div)).$mount();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should not import a component when user prefers reduced motion', async () => {
    const fn = vi.fn();
    useMatchMedia('(prefers-reduced-motion)');

    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importOnMediaQuery(() => {
            fn();
            return Promise.resolve(Component);
          }, 'not (prefers-reduced-motion)'),
      },
    });

    await (new AppOverride(div)).$mount();
    expect(fn).toHaveBeenCalledTimes(0);
    expect(getInstanceFromElement(component, Component)).toBeNull();
  });
});
