import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import {
  intersectionObserverBeforeAllCallback,
  intersectionObserverAfterEachCallback,
  mockIsIntersecting,
  mockScroll,
  restoreScroll,
  advanceTimersByTimeAsync,
  useFakeTimers,
  useRealTimers,
  h,
  resizeWindow,
} from '#test-utils';

beforeAll(() => {
  intersectionObserverBeforeAllCallback();
});

beforeEach(() => {
  mockScroll();
  useFakeTimers();
});

afterEach(() => {
  intersectionObserverAfterEachCallback();
  restoreScroll();
  useRealTimers();
});

function getDiv() {
  const div = h('div');
  const offsetTopSpy = vi.fn(() => 500);
  const offsetLeftSpy = vi.fn(() => 500);
  const offsetWidthSpy = vi.fn(() => 100);
  const offsetHeightSpy = vi.fn(() => 100);
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
  const divRectSpy = vi.spyOn(div, 'getBoundingClientRect');
  // @ts-ignore
  divRectSpy.mockImplementation(() => ({
    height: 100,
    width: 100,
    top: 500,
    y: 500,
    left: 500,
    x: 500,
  }));

  return div;
}

describe('The withScrolledInView decorator', () => {
  it('should trigger the `scrolledInView` hook when in view', async () => {
    const div = getDiv();
    const div2 = getDiv();
    const fn = vi.fn();
    const fnCb = vi.fn();
    const fn2 = vi.fn();

    class Foo extends withScrolledInView(Base) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);

        return fnCb;
      }
    }

    class Bar extends withScrolledInView(Base, { useOffsetSizes: true }) {
      static config = {
        name: 'Bar',
      };

      scrolledInView(props) {
        fn2(props);
      }
    }

    const foo = new Foo(div);
    const bar = new Bar(div2);
    mockIsIntersecting(div, true);
    mockIsIntersecting(div2, true);
    await advanceTimersByTimeAsync(1);
    expect(foo.$isMounted).toBe(true);
    expect(bar.$isMounted).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fnCb).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(foo.props);
    expect(fnCb).toHaveBeenLastCalledWith(foo.props);
    expect(fn2).toHaveBeenCalledTimes(1);

    foo.$emit('scrolled', { changed: { y: true, x: false } });
    bar.$emit('scrolled', { changed: { y: true, x: false } });
    await advanceTimersByTimeAsync(1100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fnCb).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
  });

  it('should trigger the `scrolledInView` hook on resize', async () => {
    useFakeTimers();
    const div = getDiv();
    const fn = vi.fn();

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
    await advanceTimersByTimeAsync(50);
    expect(foo.$isMounted).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    await resizeWindow({ width: 1280 });
    expect(fn).toHaveBeenCalledTimes(3);
    useRealTimers();
  });

  it('should reset the damped values when destroyed', async () => {
    useFakeTimers();
    const div = getDiv();
    const fn = vi.fn();

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
    await advanceTimersByTimeAsync(50);
    expect(foo.$isMounted).toBe(true);
    mockIsIntersecting(div, false);
    await advanceTimersByTimeAsync(50);
    expect(foo.$isMounted).toBe(false);
    expect(foo.props.dampedCurrent.x).toBe(foo.props.current.x);
    expect(foo.props.dampedCurrent.y).toBe(foo.props.current.y);
    expect(foo.props.dampedProgress.x).toBe(foo.props.progress.x);
    expect(foo.props.dampedProgress.y).toBe(foo.props.progress.y);

    useRealTimers();
  });
});
