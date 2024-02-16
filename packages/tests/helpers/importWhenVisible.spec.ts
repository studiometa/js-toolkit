/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';
import { html } from 'htl';
import { Base, withExtraConfig, importWhenVisible } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
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
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component when a parent ref is visible', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
      <button data-ref="btn">Button</button>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      refs: ['btn'],
      components: {
        Component: (app) =>
          importWhenVisible(
            () => Promise.resolve(Component),
            app.$refs.btn
          ),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    mockIsIntersecting(div.lastElementChild, false);
    await wait(0);
    expect(div.firstElementChild.__base__).toBeUndefined();
    mockIsIntersecting(div.lastElementChild, true);
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
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
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });
});
