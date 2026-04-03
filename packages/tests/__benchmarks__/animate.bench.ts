import { describe, bench } from 'vitest';
import { animate } from '@studiometa/js-toolkit/utils';
import type { Keyframe } from '#private/utils/css/animate.js';

// Create elements once, reuse across benchmarks
const elements: HTMLElement[] = [];
for (let i = 0; i < 100; i++) {
  const el = document.createElement('div');
  el.style.cssText = 'width: 100px; height: 100px;';
  document.body.appendChild(el);
  elements.push(el);
}

// Pre-create some animations for progress benchmarks
const el = elements[0];
const els5 = elements.slice(0, 5);
const els10 = elements.slice(0, 10);
const els50 = elements.slice(0, 50);

describe('animate', () => {
  describe('creation', () => {
    bench('create with simple keyframes (opacity)', () => {
      animate(el, [{ opacity: 0 }, { opacity: 1 }]);
    });

    bench('create with transform keyframes (x, y)', () => {
      animate(el, [{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    });

    bench('create with multiple transforms', () => {
      animate(el, [
        { x: 0, y: 0, scale: 1, rotate: 0 },
        { x: 100, y: 100, scale: 1.5, rotate: 180 },
      ]);
    });

    bench('create with 4 keyframes', () => {
      animate(el, [
        { opacity: 0, x: 0 },
        { opacity: 0.5, x: 50 },
        { opacity: 0.75, x: 75 },
        { opacity: 1, x: 100 },
      ]);
    });

    bench('create with custom properties', () => {
      animate(el, [{ '--progress': 0 }, { '--progress': 1 }]);
    });

    bench('create with easing per keyframe', () => {
      animate(el, [
        { x: 0 },
        { x: 50, easing: [0.4, 0, 0.2, 1] },
        { x: 100, easing: (t) => t * t },
      ]);
    });

    bench('create with all options', () => {
      animate(
        el,
        [{ x: 0, opacity: 1 }, { x: 100, opacity: 0 }],
        {
          duration: 0.5,
          delay: 0.1,
          easing: [0.4, 0, 0.2, 1],
          onStart: () => {},
          onProgress: () => {},
          onFinish: () => {},
        },
      );
    });
  });

  describe('progress updates (single element)', () => {
    const animOpacity = animate(el, [{ opacity: 0 }, { opacity: 1 }]);
    const animTransform = animate(el, [{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    const animMultiTransform = animate(el, [
      { x: 0, y: 0, scale: 1, rotate: 0, skewX: 0 },
      { x: 100, y: 100, scale: 2, rotate: 360, skewX: 15 },
    ]);
    const animCustomProps = animate(el, [
      { '--a': 0, '--b': 0, '--c': 0 },
      { '--a': 1, '--b': 100, '--c': 50 },
    ]);
    const anim4Keyframes = animate(el, [
      { x: 0, opacity: 0 },
      { x: 33, opacity: 0.33 },
      { x: 66, opacity: 0.66 },
      { x: 100, opacity: 1 },
    ]);

    bench('progress update (opacity only)', () => {
      animOpacity.progress(Math.random());
    });

    bench('progress update (x, y transform)', () => {
      animTransform.progress(Math.random());
    });

    bench('progress update (5 transforms)', () => {
      animMultiTransform.progress(Math.random());
    });

    bench('progress update (3 custom properties)', () => {
      animCustomProps.progress(Math.random());
    });

    bench('progress update (4 keyframes)', () => {
      anim4Keyframes.progress(Math.random());
    });
  });

  describe('progress updates (multiple elements)', () => {
    const keyframes: Keyframe[] = [{ x: 0, opacity: 0 }, { x: 100, opacity: 1 }];
    const anim5 = animate(els5, keyframes);
    const anim10 = animate(els10, keyframes);
    const anim50 = animate(els50, keyframes);

    bench('progress update (5 elements)', () => {
      anim5.progress(Math.random());
    });

    bench('progress update (10 elements)', () => {
      anim10.progress(Math.random());
    });

    bench('progress update (50 elements)', () => {
      anim50.progress(Math.random());
    });
  });

  describe('staggered animations', () => {
    const keyframes: Keyframe[] = [{ x: 0, opacity: 0 }, { x: 100, opacity: 1 }];
    const animStaggerNum = animate(els10, keyframes, { stagger: 0.1 });
    const animStaggerFn = animate(els10, keyframes, { stagger: (_el, i) => i * 0.1 });

    bench('progress with numeric stagger', () => {
      animStaggerNum.progress(Math.random());
    });

    bench('progress with function stagger', () => {
      animStaggerFn.progress(Math.random());
    });
  });

  describe('lifecycle', () => {
    bench('start/pause cycle', () => {
      const anim = animate(el, [{ x: 0 }, { x: 100 }]);
      anim.start();
      anim.pause();
    });

    bench('start/finish cycle', () => {
      const anim = animate(el, [{ x: 0 }, { x: 100 }]);
      anim.start();
      anim.finish();
    });
  });
});
