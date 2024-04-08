import { describe, it, expect, jest, beforeEach } from 'bun:test';
import { Base, createApp } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { features } from '../../js-toolkit/Base/features.js';
import { h } from '../__utils__/h.js';

describe('The `createApp` function', () => {
  const fn = jest.fn();
  const ctorFn = jest.fn();

  class App extends Base {
    static config = {
      name: 'App',
    };

    constructor(...args) {
      super(...args);
      ctorFn();
    }

    mounted() {
      fn();
    }
  }

  beforeEach(() => {
    fn.mockRestore();
    ctorFn.mockRestore();
  });

  it('should instantiate the app directly if the page is alreay loaded', async () => {
    const useApp = createApp(App, h('div'));
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(1);
    const app = await useApp();
    expect(app).toBeInstanceOf(App);
  });

  it('should instantiate the app on `document.body` if no root element given', async () => {
    const useApp = createApp(App);
    await wait(1);
    const app = await useApp();
    expect(app.$el).toBe(document.body);
  });

  it('should instantiate the app on page load', async () => {
    const readyStateMock = jest.fn();
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
    await wait(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await app).toBeInstanceOf(App);

    Object.defineProperty(document, 'readyState', {
      configurable: true,
      value: readyState,
    });
  });

  it('should enable given features', () => {
    expect(features.get('asyncChildren')).toBe(true);
    createApp(App, {
      features: {
        asyncChildren: false,
      },
    });
    expect(features.get('asyncChildren')).toBe(false);
    features.set('asyncChildren', true);
  });

  it('should instantiate directly when the asynChildren feature is enabled', async () => {
    const useApp = createApp(App, {
      features: {
        asyncChildren: false,
      },
    });
    expect(ctorFn).toHaveBeenCalledTimes(1);
    expect(useApp()).toBeInstanceOf(Promise);
    expect(await useApp()).toBeInstanceOf(App);
    features.set('asyncChildren', true);
  });
});
