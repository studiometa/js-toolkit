import { describe, bench } from 'vitest';
import { tween } from '@studiometa/js-toolkit/utils';
import { normalizeEase } from '#private/utils/tween.js';

describe('tween', () => {
  describe('creation', () => {
    bench('create tween with defaults', () => {
      tween(() => {});
    });

    bench('create tween with duration', () => {
      tween(() => {}, { duration: 0.5 });
    });

    bench('create tween with easing function', () => {
      tween(() => {}, { easing: (t) => t * t });
    });

    bench('create tween with bezier curve', () => {
      tween(() => {}, { easing: [0.4, 0, 0.2, 1] });
    });

    bench('create tween with all options', () => {
      tween(() => {}, {
        duration: 0.5,
        delay: 0.1,
        easing: [0.4, 0, 0.2, 1],
        onStart: () => {},
        onProgress: () => {},
        onFinish: () => {},
      });
    });

    bench('create tween with smooth mode', () => {
      tween(() => {}, { smooth: 0.1 });
    });

    bench('create tween with spring mode', () => {
      tween(() => {}, { spring: 0.1, mass: 1 });
    });
  });

  describe('progress updates', () => {
    const tweenDefault = tween(() => {});
    const tweenEasing = tween(() => {}, { easing: (t) => t * t });
    const tweenBezier = tween(() => {}, { easing: [0.4, 0, 0.2, 1] });
    const tweenSmooth = tween(() => {}, { smooth: 0.1 });
    const tweenSpring = tween(() => {}, { spring: 0.1 });

    bench('progress update (linear)', () => {
      tweenDefault.progress(Math.random());
    });

    bench('progress update (easing function)', () => {
      tweenEasing.progress(Math.random());
    });

    bench('progress update (bezier curve)', () => {
      tweenBezier.progress(Math.random());
    });

    bench('progress update (smooth)', () => {
      tweenSmooth.progress(Math.random());
    });

    bench('progress update (spring)', () => {
      tweenSpring.progress(Math.random());
    });
  });

  describe('normalizeEase', () => {
    bench('normalize undefined (fallback to linear)', () => {
      normalizeEase(undefined as any);
    });

    bench('normalize function', () => {
      normalizeEase((t) => t * t);
    });

    bench('normalize bezier curve', () => {
      normalizeEase([0.4, 0, 0.2, 1]);
    });
  });

  describe('lifecycle', () => {
    bench('start/pause cycle', () => {
      const tw = tween(() => {});
      tw.start();
      tw.pause();
    });

    bench('start/finish cycle', () => {
      const tw = tween(() => {});
      tw.start();
      tw.finish();
    });
  });
});
