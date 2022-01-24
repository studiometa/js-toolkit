import { jest } from '@jest/globals';
import { Base } from '@studiometa/js-toolkit';
import withIntersectionObserver from '@studiometa/js-toolkit/decorators/withIntersectionObserver';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
  intersectionMockInstance,
} from '../__setup__/mockIntersectionObserver';

beforeAll(() => beforeAllCallback());
afterEach(() => afterEachCallback());

describe('The withIntersectionObserver decorator', () => {
  it('should start when mounted and stop when destroyed', async () => {
    const fn = jest.fn();
    class Foo extends withIntersectionObserver(Base) {
      static config = {
        name: 'Foo',
      };

      intersected(...args) {
        fn(...args);
      }
    }

    const div = document.createElement('div');
    const foo = new Foo(div).$mount();
    const observer = intersectionMockInstance(div);
    expect(foo.$observer).not.toBeUndefined();
    expect(observer.observe).toHaveBeenCalledTimes(1);
    mockIsIntersecting(div, true);
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$destroy();
    expect(observer.unobserve).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(1);
    foo.$mount();
    expect(observer.observe).toHaveBeenCalledTimes(2);
  });

  it('should be able to be used without the `intersected` method', () => {
    const fn = jest.fn();
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
    new Foo(div).$mount();
    mockIsIntersecting(div.firstElementChild, true);
    expect(fn).toHaveBeenCalledTimes(1);
    mockIsIntersecting(div.firstElementChild, true);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
