import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Base, createApp } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
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
    const { App, fn, features } = getContext();
    expect(features.get('blocking')).toBe(false);
    createApp(App, {
      blocking: true,
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
});
