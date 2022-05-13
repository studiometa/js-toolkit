import { animate } from '@studiometa/js-toolkit/utils';
import wait from '../../__utils__/wait.js';

describe('The `animate` utility function', () => {
  it('should animate an element', () => {
    return new Promise((resolve) => {
      const div = document.createElement('div');
      animate(
        div,
        [
          { transformOrigin: 'top right' },
          { scaleX: 0 },
          { opacity: 0, x: 100, transformOrigin: 'top left' },
        ],
        {
          duration: 0.1,
          onFinish: () => {
            expect(div.style.opacity).toBe('0');
            expect(div.style.transform).toBe('translate3d(100px, 0px, 0px) scaleX(1) ');
            expect(div.style.transformOrigin).toBe('top left');
            resolve();
          },
        }
      ).start();
    });
  });

  it('should be able to be paused and play', async () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { x: 100 }], {
      duration: 1,
    });

    animation.start();
    animation.play();
    await wait(500);
    animation.pause();
    animation.play();
    await wait(600);
    expect(animation.progress()).toBe(1);
    expect(div.style.transform).toBe('translate3d(100px, 0px, 0px) ');
  });

  it('should be able to set the progress', () => {
    const div = document.createElement('div');
    const animation = animate(div, [{}, { opacity: 0, transformOrigin: 'top left' }, {}, {}]);
    animation.progress(0.25);
    expect(div.style.opacity).toBe('0.25');
    animation.progress(1);
    expect(div.style.opacity).toBe('');
  });

  // it('should be able to be stopped')
  // it('should be able to resolve relative values')
  // it('should implement easing functions and bezier curves')
});
