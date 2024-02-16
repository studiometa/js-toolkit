import { describe, it, expect, jest, beforeEach, afterEach } from 'bun:test';
import { animate } from '@studiometa/js-toolkit/utils';
import type { TransformProps } from '@studiometa/js-toolkit/utils';
import {
  useFakeTimers,
  useRealTimers,
  advanceTimersByTimeAsync,
} from '../../__utils__/faketimers.js';

describe('The `animate` utility function', () => {
  beforeEach(() => useFakeTimers());
  afterEach(() => useRealTimers());

  it('should animate an element', async () => {
    const fn = jest.fn();

    const div = document.createElement('div');
    animate(
      div,
      [
        { transformOrigin: 'top right' },
        { scaleX: 0, offset: 0.75 },
        { opacity: 0, x: 100, transformOrigin: 'top left' },
      ],
      {
        onStart: fn(),
      },
    ).start();

    await advanceTimersByTimeAsync(10000);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(div.style.opacity).toBe('0');
    expect(div.style.transform.trim()).toBe('translate3d(100px, 0px, 0px) scaleX(1)');
    expect(div.style.transformOrigin).toBe('top left');
  });

  it('should work without options', async () => {
    const div = document.createElement('div');
    const controls = animate(div, [{ opacity: 1 }, { opacity: 0 }]);
    controls.play();
    await advanceTimersByTimeAsync(2000);
    expect(div.style.opacity).toBe('0');
  });

  it('should default to sane values when they are not defined in a `to` keyframe', async () => {
    const stubs = [
      ['opacity', 0, '1'],
      ['x', 10, 'translate3d(0px, 0px, 0px) '],
      ['y', 10, 'translate3d(0px, 0px, 0px) '],
      ['z', 10, 'translate3d(0px, 0px, 0px) '],
      ['scale', 10, 'scale(1) '],
      ['scaleX', 10, 'scaleX(1) '],
      ['scaleY', 10, 'scaleY(1) '],
      ['scaleZ', 10, 'scaleZ(1) '],
      ['rotate', 10, 'rotate(0deg) '],
      ['rotateX', 10, 'rotateX(0deg) '],
      ['rotateY', 10, 'rotateY(0deg) '],
      ['rotateZ', 10, 'rotateZ(0deg) '],
      ['skew', 10, 'skew(0deg) '],
      ['skewX', 10, 'skewX(0deg) '],
      ['skewY', 10, 'skewY(0deg) '],
    ] as [string, number, string][];

    for await (const [prop, value, result] of stubs) {
      const div = document.createElement('div');
      animate(div, [{ [prop]: value }, {}]).start();
      await advanceTimersByTimeAsync(2000);
      expect(div.style[prop === 'opacity' ? 'opacity' : 'transform'].trim()).toBe(result.trim());
    }
  });

  it('should be able to be paused and play', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { scale: 2 }, {}, {}], {
      duration: 1,
    });
    animation.start();
    animation.play();
    await advanceTimersByTimeAsync(500);
    animation.pause();
    // We can not test that the scale value is exactly 1.5,
    // so we test the presence of a scale transform.
    expect(div.style.transform).toMatch('scale(');
    animation.play();
    await advanceTimersByTimeAsync(600);
    expect(animation.progress()).toBe(1);
    expect(div.style.transform).toBe('');
  });

  it('should be able to set the progress', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { opacity: 0, transformOrigin: 'top left' }, {}, {}]);
    animation.progress(0.25);
    await advanceTimersByTimeAsync(16);
    expect(div.style.opacity).toBe('0.25');
    animation.progress(1);
    await advanceTimersByTimeAsync(16);
    expect(div.style.opacity).toBe('');
  });

  it('should be able to resolve relative values', async () => {
    const getDiv = () => {
      const div = document.createElement('div');
      Object.defineProperties(div, {
        offsetWidth: {
          get() {
            return 300;
          },
        },
        offsetHeight: {
          get() {
            return 200;
          },
        },
      });
      return div;
    };

    const stubs = [
      ['x', [100, 'ch'], () => 'translate3d(100px, 0px, 0px) '],
      ['x', [100, '%'], (div) => `translate3d(${div.offsetWidth}px, 0px, 0px) `],
      ['y', [100, '%'], (div) => `translate3d(0px, ${div.offsetHeight}px, 0px) `],
      ['z', [100, '%'], (div) => `translate3d(0px, 0px, ${div.offsetWidth}px) `],
      ['x', [100, 'vw'], () => `translate3d(${window.innerWidth}px, 0px, 0px) `],
      ['x', [100, 'vh'], () => `translate3d(${window.innerHeight}px, 0px, 0px) `],
      [
        'x',
        [100, 'vmin'],
        () => `translate3d(${Math.min(window.innerWidth, window.innerHeight)}px, 0px, 0px) `,
      ],
      [
        'x',
        [100, 'vmax'],
        () => `translate3d(${Math.max(window.innerWidth, window.innerHeight)}px, 0px, 0px) `,
      ],
    ] as Array<[keyof TransformProps, [number, string], (div?: HTMLElement) => string]>;

    for await (const [prop, value, result] of stubs) {
      const div = getDiv();
      animate(div, [{}, { [prop]: value }]).start();
      await advanceTimersByTimeAsync(2000);
      expect(div.style.transform.trim()).toBe(result(div).trim());
    }
  });

  it('should be able to be finished', async () => {
    const div = document.createElement('div');
    const fn = jest.fn();
    const animation = animate(div, [{ x: 0 }, { x: 100 }], { duration: 1, onFinish: fn });
    animation.start();
    await advanceTimersByTimeAsync(500);
    animation.finish();
    await advanceTimersByTimeAsync(16);
    expect(animation.progress()).toBe(1);
    await advanceTimersByTimeAsync(16);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should implement easing functions and bezier curves', async () => {
    const div = document.createElement('div');
    const fn = jest.fn();
    const animation = animate(div, [{ x: 0 }, { x: 100, easing: [0, 0, 1, 1] }], {
      duration: 1,
      easing: (value) => {
        fn(value);
        return value;
      },
    });
    animation.start();
    await advanceTimersByTimeAsync(1000);
    expect(fn).toHaveBeenCalled();
  });

  it('should stop previous animations', async () => {
    const div = document.createElement('div');
    const animation1 = animate(div, [{ x: 0 }, { x: 100 }], { duration: 0.4 });
    const animation2 = animate(div, [{ y: 100 }, {}], { duration: 0.3 });
    animation1.start();
    await advanceTimersByTimeAsync(10);
    const p1 = animation1.progress();
    animation2.start();
    await advanceTimersByTimeAsync(10);
    const p2 = animation1.progress();
    expect(p1).toEqual(p2);
  });

  it('should animate CSS custom properties', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{ '--var': 0 }, { '--var': 1 }]);
    animation.progress(0);
    await advanceTimersByTimeAsync(1);
    expect(div.style.getPropertyValue('--var')).toBe('0');
    animation.progress(0.5);
    await advanceTimersByTimeAsync(1);
    expect(div.style.getPropertyValue('--var')).toBe('0.5');
    animation.progress(1);
    await advanceTimersByTimeAsync(1);
    expect(div.style.getPropertyValue('--var')).toBe('1');
  });

  // should be able to specify offset
});