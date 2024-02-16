/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect, jest, beforeAll } from 'bun:test';
import { html } from 'htl';
import { Base, withExtraConfig, importWhenIdle, } from '@studiometa/js-toolkit';
import wait from '../__utils__/wait';
import { mockRequestIdleCallback } from '../__setup__/mockRequestIdleCallback';

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

describe('The `importWhenIdle` lazy import helper', () => {
  it('should import a component when idle', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) => importWhenIdle(() => Promise.resolve(Component)),
      },
    });

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    mockRequestIdleCallback();
    await wait(0);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);
  });

  it('should import a component in the next macrotask when `requestIdleCallback` is not supported', async () => {
    const div = html`<div>
      <div data-component="Component"></div>
    </div>`;

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) => importWhenIdle(() => Promise.resolve(Component), { timeout: 100 }),
      },
    });

    const { requestIdleCallback } = globalThis;
    delete globalThis.requestIdleCallback;

    new AppOverride(div).$mount();

    expect(div.firstElementChild.__base__).toBeUndefined();
    await wait(101);
    expect(div.firstElementChild.__base__.get(Component)).toBeInstanceOf(Component);

    globalThis.requestIdleCallback = requestIdleCallback;
  });
});
