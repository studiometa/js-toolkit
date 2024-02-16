/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import { describe, it, expect, jest, beforeAll, beforeEach, afterEach } from 'bun:test';
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
} from '../../__setup__/mockIntersectionObserver.js';
import wait from '../../__utils__/wait.js';

beforeAll(() => beforeAllCallback());

let div;
let divRectSpy;
let offsetTopSpy;
let offsetLeftSpy;
let offsetWidthSpy;
let offsetHeightSpy;
const fn = jest.fn();

beforeEach(() => {
  fn.mockClear();
  Object.defineProperties(window, {
    pageYOffset: {
      configurable: true,
      value: 0,
    },
    pageXOffset: {
      configurable: true,
      value: 0,
    },
  });

  div = document.createElement('div');
  offsetTopSpy = jest.fn(() => 500);
  offsetLeftSpy = jest.fn(() => 500);
  offsetWidthSpy = jest.fn(() => 100);
  offsetHeightSpy = jest.fn(() => 100);
  Object.defineProperties(div, {
    offsetTop: {
      get() {
        return offsetTopSpy();
      },
    },
    offsetLeft: {
      get() {
        return offsetLeftSpy();
      },
    },
    offsetWidth: {
      get() {
        return offsetWidthSpy();
      },
    },
    offsetHeight: {
      get() {
        return offsetHeightSpy();
      },
    },
  });
  divRectSpy = jest.spyOn(div, 'getBoundingClientRect');
  divRectSpy.mockImplementation(() => ({
    height: 100,
    width: 100,
    top: 500,
    y: 500,
    left: 500,
    x: 500,
  }));
});

afterEach(() => {
  afterEachCallback();
  divRectSpy.mockRestore();
  offsetTopSpy.mockRestore();
  offsetLeftSpy.mockRestore();
  offsetWidthSpy.mockRestore();
  offsetHeightSpy.mockRestore();
});

describe('The withScrolledInView decorator', () => {
  it('should trigger the `scrolledInView` hook when in view', async () => {
    class Foo extends withScrolledInView(Base) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
      }
    }
    new Foo(div);

    mockIsIntersecting(div, true);
    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset = 10;
    window.pageXOffset = 10;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;

    await wait(50);
    const [last] = fn.mock.calls.pop();
    delete last.dampedProgress;
    delete last.dampedCurrent;
    expect(last).toMatchSnapshot();
    scrollHeightSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });

  it('should trigger the `scrolledInView` hook when in view with the `useOffsetSizes` option', async () => {
    class Foo extends withScrolledInView(Base, { useOffsetSizes: true }) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
      }
    }
    new Foo(div);

    mockIsIntersecting(div, true);
    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset = 10;
    window.pageXOffset = 10;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;

    await wait(50);
    const [last] = fn.mock.calls.pop();
    delete last.dampedProgress;
    delete last.dampedCurrent;
    expect(last).toMatchSnapshot();
    scrollHeightSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });

  it('should reset the damped values when destroyed', async () => {
    // @todo test if dampedCurrent and dampedProgress values are reset to their min or max on destroy.
    class Foo extends withScrolledInView(Base) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
      }
    }
    const foo = new Foo(div);

    mockIsIntersecting(div, true);
    expect(foo.$isMounted).toBe(true);

    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset = 10;
    window.pageXOffset = 10;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset = 1000;
    window.pageXOffset = 1000;

    await wait(10);

    mockIsIntersecting(div, false);

    await wait(50);

    expect(foo.$isMounted).toBe(false);
    expect(foo.__props.dampedCurrent.x).toBe(foo.__props.current.x);
    expect(foo.__props.dampedCurrent.y).toBe(foo.__props.current.y);
    expect(foo.__props.dampedProgress.x).toBe(foo.__props.progress.x);
    expect(foo.__props.dampedProgress.y).toBe(foo.__props.progress.y);
  });
});
