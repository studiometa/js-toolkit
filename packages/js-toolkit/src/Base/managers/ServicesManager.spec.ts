import { describe, it, expect, vi } from 'vitest';
import { Base } from '@studiometa/js-toolkit';
import { useFakeTimers, useRealTimers, runAllTimers } from '#test-utils';

async function getContext() {
  const fn = vi.fn();

  class App extends Base {
    static config = {
      name: 'App',
    };

    resized() {
      fn();
    }

    customService() {
      fn();
    }
  }

  const app = new App(document.createElement('div'));
  await app.$mount();

  return { app, App, fn };
}

describe('The ServicesManager', () => {
  it('should return false if the service does not exists', async () => {
    const { app } = await getContext();
    expect(app.$services.has('foo')).toBe(false);
  });

  it('should not enable a service twice', async () => {
    const { app, fn } = await getContext();
    useFakeTimers();
    app.$services.disable('resized');
    app.$services.enable('resized');
    app.$services.enable('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    useRealTimers();
  });

  it('should not disable a service that does not exist', async () => {
    const { app } = await getContext();
    expect(app.$services.disable('foo')).toBeUndefined();
  });

  it('should be able to toggle services', async () => {
    const { app, fn } = await getContext();
    useFakeTimers();
    app.$services.toggle('resized', false);
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).not.toHaveBeenCalled();
    app.$services.toggle('resized', true);
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    app.$services.toggle('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    app.$services.toggle('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(2);
    useRealTimers();
  });

  it('should enable a service when it is used via event handlers', async () => {
    const { fn } = await getContext();
    useFakeTimers();
    window.dispatchEvent(new CustomEvent('resize'));
    runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    useRealTimers();
  });

  it('should be able to unregister custom services but not core services', async () => {
    const { app } = await getContext();
    expect(() => app.$services.unregister('resized')).toThrow(
      /core service can not be unregistered/,
    );
  });

  it('should be able to register new services', async () => {
    const { app, fn } = await getContext();
    let handler;
    const add = vi.fn();
    const service = {
      add: (id, cb) => {
        add();
        handler = cb;
      },
      remove: vi.fn(),
      props: vi.fn(),
      has: vi.fn(),
    };

    app.$services.register('customService', () => service);
    app.$services.enable('customService');
    expect(add).toHaveBeenCalledTimes(1);
    handler();
    expect(fn).toHaveBeenCalledTimes(1);
    app.$services.disable('customService');
    expect(service.remove).toHaveBeenCalledTimes(1);
    app.$services.unregister('customService');
  });

  it('should expose each services props', async () => {
    const { app } = await getContext();
    expect(app.$services.get('ticked')).toHaveProperty('time');
  });
});
