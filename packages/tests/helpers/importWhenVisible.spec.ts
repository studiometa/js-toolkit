import { describe, it, expect, beforeAll, afterEach } from 'vitest';
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
} from '#test-utils';
import { wait } from '#private/utils';

beforeAll(() => {
  intersectionObserverBeforeAllCallback();
});

afterEach(() => {
  intersectionObserverAfterEachCallback();
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

    await new AppOverride(div).$mount();
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(component, false);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(component, true);
    await wait(1);
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

    await new AppOverride(div).$mount();

    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(btn, false);
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(btn, true);
    await wait(1);
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

    await new AppOverride(div).$mount();
    expect(getInstanceFromElement(component, Component)).toBeNull();
    mockIsIntersecting(document.body, true);
    await wait(1);
    expect(getInstanceFromElement(component, Component)).toBeInstanceOf(Component);
  });
});
