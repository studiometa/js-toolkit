/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect, jest, afterEach } from 'bun:test';
import { html } from 'htl';
import { Base, withExtraConfig, importWhenPrefersMotion } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { matchMedia } from '../__utils__/matchMedia.js';

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
  afterEach(() => {
    matchMedia.clear();
  });

  it('should import a component when user prefers motion', async () => {
    const fn = jest.fn();
    const mediaQuery = 'not (prefers-reduced-motion)';
    matchMedia.useMediaQuery(mediaQuery);

    const div = html`
      <div>
        <div data-component="Component"></div>
      </div>
    `;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importWhenPrefersMotion(() => {
            fn();
            return Promise.resolve(Component);
          }, mediaQuery),
      },
    });

    const app = new AppOverride(div);
    app.$mount();
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(app.$children.Component).toHaveLength(1);
    expect(app.$children.Component[0]).toBeInstanceOf(Component);
  });

  it('should not import a component when user prefers reduced motion', async () => {
    const fn = jest.fn();
    const mediaQuery = '(prefers-reduced-motion)';
    matchMedia.useMediaQuery(mediaQuery);

    const div = html`
      <div>
        <div data-component="Component"></div>
      </div>
    `;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () =>
          importWhenPrefersMotion(() => {
            fn();
            return Promise.resolve(Component);
          }, mediaQuery),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
