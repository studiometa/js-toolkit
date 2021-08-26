import { jest } from '@jest/globals';
import { html } from 'htl';
import Base from '@studiometa/js-toolkit';
import withExtraConfig from '@studiometa/js-toolkit/decorators/withExtraConfig';
import importWhenVisible from '@studiometa/js-toolkit/lazy-import/importWhenVisible';
import wait from '../__utils__/wait';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
} from '../__setup__/mockIntersectionObserver';

beforeAll(() => beforeAllCallback());
afterEach(() => afterEachCallback());

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

describe('The `importWhenVisible` lazy import helper', () => {
  it('should import a component when it is visible', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importWhenVisible(
            () => Promise.resolve(Component),
            'Component',
            app
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    mockIsIntersecting(div.firstElementChild, false);
    await wait(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
    mockIsIntersecting(div.firstElementChild, true);
    await wait(0);
    expect(div.firstElementChild.__base__).toBeInstanceOf(Component);
  });

  it('should import a component when an element outside the app context is visible', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) =>
          importWhenVisible(
            () => Promise.resolve(Component),
            'body',
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    mockIsIntersecting(document.body, true);
    await wait(0);
    expect(div.firstElementChild.__base__).toBeInstanceOf(Component);
  });
});
