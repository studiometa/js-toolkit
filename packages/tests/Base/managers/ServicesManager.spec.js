import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';

describe('The ServicesManager', () => {
  const fn = jest.fn();

  class App extends Base {
    static config = {
      name: 'App',
    }

    resized() {
      fn();
    }
  }

  const app = new App(document.createElement('div')).$mount();

  it('should return false if the service does not exists', () => {
    expect(app.$services.has('foo')).toBe(false);
  });

  // 71
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

  // 127
  it('should not disable a service that does not exist', () => {
    expect(app.$services.disable('foo')).toBeUndefined();
  });
});
