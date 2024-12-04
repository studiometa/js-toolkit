import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Base,
  BaseConfig,
  createApp,
  getInstanceFromElement,
  getInstances,
} from '@studiometa/js-toolkit';
import {
  h,
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
  mockFeatures,
} from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

function getContext({ blocking = false } = {}) {
  const { features } = mockFeatures({ blocking });

  const fn = vi.fn();
  const ctorFn = vi.fn();

  class App extends Base {
    static config = {
      name: 'App',
    };

    constructor(...args: [HTMLElement]) {
      super(...args);
      ctorFn();
    }

    mounted() {
      fn();
    }
  }

  return { App, fn, ctorFn, features };
}

describe('The `createApp` function', () => {
  it('should instantiate the app directly if the page is alreay loaded', async () => {
    const { App, fn } = getContext();
    const useApp = createApp(App, h('div'));
    await advanceTimersByTimeAsync(10);
    expect(fn).toHaveBeenCalledTimes(1);
    const app = await useApp();
    expect(app).toBeInstanceOf(App);
  });

  it('should instantiate the app on `document.body` if no root element given', async () => {
    const { App } = getContext();
    const useApp = createApp(App);
    await advanceTimersByTimeAsync(1);
    const app = await useApp();
    expect(app.$el).toBe(document.body);
  });

  it('should instantiate the app on page load', async () => {
    const { App, fn } = getContext();
    const readyStateMock = vi.fn();
    const { readyState } = document;
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get() {
        return readyStateMock();
      },
    });

    // Loading state
    readyStateMock.mockImplementation(() => 'loading');
    const useApp = createApp(App, document.createElement('div'));
    const app = useApp();
    expect(fn).not.toHaveBeenCalled();
    expect(app).toBeInstanceOf(Promise);
    expect(app).toEqual(useApp());

    // Interactive state
    readyStateMock.mockImplementation(() => 'interactive');
    document.dispatchEvent(new CustomEvent('readystatechange'));
    expect(fn).not.toHaveBeenCalled();
    expect(app).toBeInstanceOf(Promise);

    // Complete state
    readyStateMock.mockImplementation(() => 'complete');
    document.dispatchEvent(new CustomEvent('readystatechange'));
    await advanceTimersByTimeAsync(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await app).toBeInstanceOf(App);

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: readyState,
    });
  });

  it('should enable given features', () => {
    const { App, features } = getContext();
    expect(features.get('blocking')).toBe(false);
    createApp(App, {
      blocking: true,
      prefix: 'w',
      attributes: {
        component: 'tk-is',
        option: 'tk-opt',
        ref: 'tk-ref',
      },
      breakpoints: {
        s: '0rem',
        m: '80rem',
        l: '120rem',
      },
    });
    expect(features.get('blocking')).toBe(true);
    expect(features.get('prefix')).toBe('w');
    expect(features.get('attributes')).toEqual({
      component: 'tk-is',
      option: 'tk-opt',
      ref: 'tk-ref',
    });
    expect(features.get('breakpoints')).toEqual({
      s: '0rem',
      m: '80rem',
      l: '120rem',
    });
  });

  it('should instantiate directly when the blocking feature is enabled', async () => {
    const { App, ctorFn } = getContext();
    const useApp = createApp(App, {
      blocking: true,
    });
    expect(ctorFn).toHaveBeenCalledTimes(1);
    expect(useApp()).toBeInstanceOf(Promise);
    expect(await useApp()).toBeInstanceOf(App);
  });

  it('should terminate instances whose root element has been removed from the DOM', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    class App extends Base {
      static config: BaseConfig = {
        name: 'App',
        components: {
          Component,
        },
      };
    }

    const componentEl = h('div', { dataComponent: 'Component' });
    document.body.append(componentEl);
    const app = await createApp(App)();
    const component = getInstanceFromElement(componentEl, Component);
    expect(app.$children.Component[0]).toBe(component);
    expect(component.$isMounted).toBe(true);
    expect(getInstances(Component)).toHaveLength(1);
    expect(componentEl.isConnected).toBe(true);

    document.body.innerHTML = '';
    await advanceTimersByTimeAsync(100);
    expect(componentEl.isConnected).toBe(false);
    expect(component.$isMounted).toBe(false);
    expect(getInstances(Component)).toHaveLength(0);
  });

  it('should not terminate instances whose root element has been moved in the DOM', async () => {
    class Component extends Base {
      static config = {
        name: 'Component',
      };
    }

    class App extends Base {
      static config: BaseConfig = {
        name: 'App',
        components: {
          Component,
        },
      };
    }

    const componentEl = h('div', { dataComponent: 'Component' });
    const div = h('div', componentEl);
    document.body.append(div);

    const app = await createApp(App)();
    const component = getInstanceFromElement(componentEl, Component);
    expect(app.$children.Component[0]).toBe(component);
    expect(component.$isMounted).toBe(true);
    expect(getInstances(Component)).toHaveLength(1);

    document.body.append(componentEl);
    await advanceTimersByTimeAsync(100);
    expect(componentEl.isConnected).toBe(true);

    expect(component.$isMounted).toBe(true);
    expect(getInstances(Component)).toHaveLength(1);
  });
});
