import { jest } from '@jest/globals';
import { html } from 'htl';
import { Base, withExtraConfig, importWhenPrefersMotion } from '@studiometa/js-toolkit';
import MatchMediaMock from 'jest-matchmedia-mock';
import wait from '../__utils__/wait';

let matchMedia;

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
  beforeAll(() => {
    // eslint-disable-next-line new-cap
    matchMedia = new MatchMediaMock.default();
  });

  afterEach(() => {
    matchMedia.clear();
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
        Component: () => importWhenPrefersMotion(() => {
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
    const mediaQuery = 'not (prefers-reduced-motion)';
    matchMedia.useMediaQuery('(prefers-reduced-motion)');

    const div = html`<div>
        <div data-component="Component"></div>
      </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importWhenPrefersMotion(() => {
          fn();
          return Promise.resolve(Component)
        }, mediaQuery),
      },
    });

    new AppOverride(div).$mount();
    await wait(0);
    expect(fn).toHaveBeenCalledTimes(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
  });
});
