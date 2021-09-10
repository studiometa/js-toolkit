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

  it('should not instantiate without `intersected` method', () => {
    class Foo extends withIntersectionObserver(Base) {
      static config = {
        name: 'Foo',
      };
    }
    const div = document.createElement('div');
    expect(() => {
      // eslint-disable-next-line no-unused-vars
      const foo = new Foo(div);
    }).toThrow(/withIntersectionObserver/);
  });
});
