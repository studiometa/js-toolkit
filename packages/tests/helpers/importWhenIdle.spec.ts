/* eslint-disable require-jsdoc, max-classes-per-file */
import { describe, it, expect } from 'bun:test';
import {
  Base,
  withExtraConfig,
  importWhenIdle,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { mockRequestIdleCallback } from '../__setup__/mockRequestIdleCallback';
import { h } from '../__utils__/h.js';
import { advanceTimersByTimeAsync, useFakeTimers, useRealTimers } from '../__utils__/faketimers';

describe('The `importWhenIdle` lazy import helper', () => {
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

  it('should import a component when idle', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importWhenIdle(() => Promise.resolve(Component)),
      },
    });

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockRequestIdleCallback();
    await wait(0);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component in the next macrotask when `requestIdleCallback` is not supported', async () => {
    useFakeTimers();
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importWhenIdle(() => Promise.resolve(Component), { timeout: 100 }),
      },
    });

    const { requestIdleCallback } = globalThis;
    delete globalThis.requestIdleCallback;

    new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    await advanceTimersByTimeAsync(101);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);

    globalThis.requestIdleCallback = requestIdleCallback;
    useRealTimers();
  });
});
