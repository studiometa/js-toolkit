import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import {
  Base,
  withExtraConfig,
  importWhenVisible,
  getInstanceFromElement,
} from '@studiometa/js-toolkit';
import {
  h,
  intersectionObserverBeforeAllCallback,
  intersectionObserverAfterEachCallback,
  mockIsIntersecting,
  advanceTimersByTimeAsync,
  useFakeTimers,
  useRealTimers,
} from '#test-utils';

beforeAll(() => {
  intersectionObserverBeforeAllCallback();
});

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  intersectionObserverAfterEachCallback();
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

describe('The `importWhenVisible` lazy import helper', () => {
  it('should import a component when it is visible', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: (app) => importWhenVisible(() => Promise.resolve(Component), 'Component', app),
      },
    });

    new AppOverride(div).$mount();

    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(component, false);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(component, true);
    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component when a parent ref is visible', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const btn = h('button', { dataRef: 'btn' });
    const div = h('div', {}, [component, btn]);

    const AppOverride = withExtraConfig(App, {
      refs: ['btn'],
      components: {
        Component: (app) => importWhenVisible(() => Promise.resolve(Component), app.$refs.btn),
      },
    });

    new AppOverride(div).$mount();

    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(btn, false);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(btn, true);
    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });

  it('should import a component when an element outside the app context is visible', async () => {
    const component = h('div', { dataComponent: 'Component' });
    const div = h('div', {}, [component]);

    const AppOverride = withExtraConfig(App, {
      components: {
        Component: () => importWhenVisible(() => Promise.resolve(Component), 'body'),
      },
    });

    new AppOverride(div).$mount();

    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(document.body, true);
    await advanceTimersByTimeAsync(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });
});
