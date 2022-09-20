import { jest } from '@jest/globals';
import { animate } from '@studiometa/js-toolkit/utils';
import wait from '../../__utils__/wait.js';

describe('The `animate` utility function', () => {
  it('should animate an element', () => {
    const fn = jest.fn();
    return new Promise((resolve) => {
      const div = document.createElement('div');
      animate(
        div,
        [
          { transformOrigin: 'top right' },
          { scaleX: 0, offset: 0.75 },
          { opacity: 0, x: 100, transformOrigin: 'top left' },
        ],
        {
          duration: 0.1,
          onStart: () => {
            fn();
          },
          onFinish: () => {
            expect(fn).toHaveBeenCalledTimes(1);
            expect(div.style.opacity).toBe('0');
            expect(div.style.transform).toBe('translate3d(100px, 0px, 0px) scaleX(1) ');
            expect(div.style.transformOrigin).toBe('top left');
            resolve();
          },
        },
      ).start();
    });
  });

  it('should work without options', async () => {
    const div = document.createElement('div');
    const controls = animate(div, [{ opacity: 1 }, { opacity: 0 }]);
    controls.play();
    await wait(1100);
    expect(div.style.opacity).toBe('0');
  });

  it('should default to sane values when they are not defined in a `to` keyframe', async () => {
    await Promise.all(
      [
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
      ].map(([prop, value, result]) => {
        return new Promise((resolve) => {
          const div = document.createElement('div');
          animate(div, [{ [prop]: value }, {}], {
            duration: 0.1,
            onFinish: () => {
              expect(div.style[prop === 'opacity' ? 'opacity' : 'transform']).toBe(result);
              resolve();
            },
          }).start();
        });
      }),
    );
  });

  it('should be able to be paused and play', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { scale: 2 }, {}, {}], {
      duration: 1,
    });

    animation.start();
    animation.play();
    await wait(500);
    animation.pause();
    // We can not test that the scale value is exactly 1.5,
    // so we test the presence of a scale transform.
    expect(div.style.transform).toMatch('scale(');
    animation.play();
    await wait(600);
    expect(animation.progress()).toBe(1);
    expect(div.style.transform).toBe('');
  });

  it('should be able to set the progress', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { opacity: 0, transformOrigin: 'top left' }, {}, {}]);
    animation.progress(0.25);
    await wait(16);
    expect(div.style.opacity).toBe('0.25');
    animation.progress(1);
    await wait(16);
    expect(div.style.opacity).toBe('');
  });

  it('should be able to resolve relative values', async () => {
    const getDiv = () => {
      const div = document.createElement('div');
      jest.spyOn(div, 'offsetWidth', 'get').mockImplementation(() => 300);
      jest.spyOn(div, 'offsetHeight', 'get').mockImplementation(() => 200);
      return div;
    };

    await Promise.all(
      [
        ['x', [100, 'ch'], () => `translate3d(100px, 0px, 0px) `],
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
      ].map(([prop, value, result]) => {
        return new Promise((resolve) => {
          const div = getDiv();
          animate(div, [{}, { [prop]: value }], {
            duration: 0.1,
            onFinish() {
              expect(div.style.transform).toBe(result(div));
              resolve();
            },
          }).start();
        });
      }),
    );
  });

  it('should be able to be finished', async () => {
    const div = document.createElement('div');
    const fn = jest.fn();
    const animation = animate(div, [{ x: 0 }, { x: 100 }], { duration: 1, onFinish: fn });
    animation.start();
    await wait(500);
    animation.finish();
    await wait(16);
    expect(animation.progress()).toBe(1);
    await wait(16);
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
    await wait(1000);
    expect(fn).toHaveBeenCalled();
  });

  it('should stop previous animations', async () => {
    const div = document.createElement('div');
    const animation1 = animate(div, [{ x: 0 }, { x: 100 }], { duration: 0.3 });
    const animation2 = animate(div, [{ y: 100 }, {}], { duration: 0.3 });
    animation1.start();
    await wait(100);
    animation2.start();
    await wait(500);
    expect(animation1.progress()).not.toBe(1);
    expect(animation2.progress()).toBe(1);
  });

  // should be able to specify offset
});
