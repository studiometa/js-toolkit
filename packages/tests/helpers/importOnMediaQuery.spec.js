import { jest } from '@jest/globals';
import { html } from 'htl';
import { Base, withExtraConfig, importOnMediaQuery } from '@studiometa/js-toolkit';
import { matchMedia } from '../__utils__/matchMedia.js';
import wait from '../__utils__/wait';

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
  afterEach(() => {
    matchMedia.clear();
  });

  it('should import a component when user changes prefers motion media query', async () => {
    const fn = jest.fn();
    const mediaQuery = 'not (prefers-reduced-motion)';

    const div = html`<div>
        <div data-component="Component"></div>
      </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importOnMediaQuery(() => {
          fn();
          return Promise.resolve(Component)
        }, mediaQuery),
      },
    });

    new AppOverride(div).$mount();
    expect(fn).not.toHaveBeenCalled();
    expect(div.firstElementChild.__base__).toBeUndefined();
    matchMedia.useMediaQuery(mediaQuery);
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component when user prefers motion', async () => {
    const fn = jest.fn();
    const mediaQuery = 'not (prefers-reduced-motion)';
    matchMedia.useMediaQuery(mediaQuery);

    const div = html`<div>
        <div data-component="Component"></div>
      </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importOnMediaQuery(() => {
          fn();
          return Promise.resolve(Component)
        }, mediaQuery),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should not import a component when user prefers reduced motion', async () => {
    const fn = jest.fn();
    matchMedia.useMediaQuery('(prefers-reduced-motion)');

    const div = html`<div>
        <div data-component="Component"></div>
      </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importOnMediaQuery(() => {
          fn();
          return Promise.resolve(Component)
        }, 'not (prefers-reduced-motion)'),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
