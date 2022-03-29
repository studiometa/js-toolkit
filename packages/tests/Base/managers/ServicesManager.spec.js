import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';

describe('The ServicesManager', () => {
  const fn = jest.fn();

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

  const app = new App(document.createElement('div')).$mount();

  beforeEach(() => {
    fn.mockClear();
  });

  it('should return false if the service does not exists', () => {
    expect(app.$services.has('foo')).toBe(false);
  });

  it('should not enable a service twice', () => {
    jest.useFakeTimers();
    app.$services.disable('resized');
    app.$services.enable('resized');
    app.$services.enable('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('should not disable a service that does not exist', () => {
    expect(app.$services.disable('foo')).toBeUndefined();
  });

  it('should be able to toggle services', () => {
    jest.useFakeTimers();
    app.$services.toggle('resized', false);
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).not.toHaveBeenCalled();
    app.$services.toggle('resized', true);
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    app.$services.toggle('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    app.$services.toggle('resized');
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('should enable a service when it is used via event handlers', () => {
    jest.useFakeTimers();

    class Test extends Base {
      static config = {
        name: 'Test',
      };

      constructor(element) {
        super(element);

        this.$on('resized', fn);
      }
    }

    const test = new Test(document.createElement('div'));
    window.dispatchEvent(new CustomEvent('resize'));
    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('should be able to unregister custom services but not core services', () => {
    expect(() => app.$services.unregister('resized')).toThrow(
      /core service can not be unregistered/
    );
  });

  it('should be able to register new services', () => {
    let handler;
    const add = jest.fn();
    const service = {
      add: (id, cb) => {
        add();
        handler = cb;
      },
      remove: jest.fn(),
      props: jest.fn(),
      has: jest.fn(),
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

  it('should expose each services props', () => {
    expect(app.$services.get('ticked')).toHaveProperty('time');
  });
});
