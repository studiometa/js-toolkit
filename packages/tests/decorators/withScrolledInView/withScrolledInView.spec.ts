/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import { describe, it, expect, spyOn, beforeAll, mock, afterEach, beforeEach } from 'bun:test';
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
} from '../../__setup__/mockIntersectionObserver.js';
import { mockScroll, restoreScroll } from '../../__utils__/scroll.js';
import {
  advanceTimersByTimeAsync,
  useFakeTimers,
  useRealTimers,
} from '../../__utils__/faketimers.js';

function getDiv() {
  const div = document.createElement('div');
  const offsetTopSpy = mock(() => 500);
  const offsetLeftSpy = mock(() => 500);
  const offsetWidthSpy = mock(() => 100);
  const offsetHeightSpy = mock(() => 100);
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
  const divRectSpy = spyOn(div, 'getBoundingClientRect');
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
  beforeAll(() => beforeAllCallback());
  beforeEach(() => {
    useFakeTimers();
    mockScroll();
  });
  afterEach(() => {
    useRealTimers();
    afterEachCallback();
    restoreScroll();
  });

  it.todo('should trigger the `scrolledInView` hook when in view', async () => {
    const div = getDiv();
    const div2 = getDiv();
    const fn = mock();
    const fn2 = mock();

    class Foo extends withScrolledInView(Base) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
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
    expect(foo.$isMounted).toBe(true);
    expect(bar.$isMounted).toBe(true);

    foo.$emit('scrolled', { changed: { y: true, x: false } });
    bar.$emit('scrolled', { changed: { y: true, x: false } });
    await advanceTimersByTimeAsync(110);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it.todo('should do nothing if there is no scroll', async () => {
    // @todo
  });

  it.todo('should reset the damped values when destroyed', async () => {
    useFakeTimers();
    const div = getDiv();
    const fn = mock();

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
