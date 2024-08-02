import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';
import {
  intersectionObserverBeforeAllCallback,
  intersectionObserverAfterEachCallback,
  mockIsIntersecting,
  intersectionMockInstance,
} from '#test-utils';

beforeAll(() => {
  intersectionObserverBeforeAllCallback();
});

afterEach(() => {
  intersectionObserverAfterEachCallback();
});

describe('The withIntersectionObserver decorator', () => {
  it('should start when mounted and stop when destroyed', async () => {
    const fn = vi.fn();
    class Foo extends withIntersectionObserver(Base) {
      static config = {
        name: 'Foo',
      };

      intersected(...args) {
        fn(...args);
      }
    }

    const div = document.createElement('div');
    const foo = new Foo(div);
    await foo.$mount();
    const observer = intersectionMockInstance(div);
    expect(foo.$observer).not.toBeUndefined();
    expect(observer.observe).toHaveBeenCalledTimes(1);
    mockIsIntersecting(div, true);
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$destroy();
    expect(observer.unobserve).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
    await foo.$mount();
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it('should be able to be used without the `intersected` method', async () => {
    const fn = vi.fn();
    class Foo extends Base {
      static config = {
        name: 'Foo',
        components: {
          Detector: withIntersectionObserver(Base),
        },
      };

      onDetectorIntersected(entries) {
        fn(entries);
      }
    }

    const div = document.createElement('div');
    div.innerHTML = '<div data-component="Detector"></div>';
    const foo = new Foo(div)
    await foo.$mount();
    mockIsIntersecting(div.firstElementChild, true);
    expect(fn).toHaveBeenCalledTimes(1);
    mockIsIntersecting(div.firstElementChild, true);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
