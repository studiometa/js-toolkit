import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  Base,
  withExtraConfig,
  importWhenIdle,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import {
  h,
  advanceTimersByTimeAsync,
  useFakeTimers,
  useRealTimers,
  mockRequestIdleCallback,
} from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

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

  it('should import a component in the next macrotask when `requestIdleCallback` is not supported', async () => {
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
    await advanceTimersByTimeAsync(1100);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);

    globalThis.requestIdleCallback = requestIdleCallback;
  });

  it('should import a component when idle', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importWhenIdle(() => Promise.resolve(Component)),
      },
    });

    new AppOverride(div).$mount();
    await advanceTimersByTimeAsync(1);

    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockRequestIdleCallback();
    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });
});
