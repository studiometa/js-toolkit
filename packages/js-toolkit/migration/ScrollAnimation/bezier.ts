import { easeLinear, type EasingFunction } from '../../src/utils/easings.js';

/**
 * The bezier easing the keyframes interpolator needs. The named curves live
 * in core; this is what core has no use for.
 */

export type { EasingFunction };

export type BezierCurve = [number, number, number, number];

const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 12;

function calcBezier(t: number, a1: number, a2: number): number {
  return (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
}

/**
 * Build the easing function for a CSS-style cubic bezier curve.
 */
export function cubicBezier(mX1: number, mY1: number, mX2: number, mY2: number): EasingFunction {
  if (mX1 === mY1 && mX2 === mY2) {
    return easeLinear;
  }

  return (progress: number) => {
    if (progress <= 0 || progress >= 1) {
      return progress;
    }

    let lower = 0;
    let upper = 1;
    let t = progress;
    for (let i = 0; i < SUBDIVISION_MAX_ITERATIONS; i += 1) {
      const x = calcBezier(t, mX1, mX2) - progress;
      if (Math.abs(x) < SUBDIVISION_PRECISION) {
        break;
      }
      if (x > 0) {
        upper = t;
      } else {
        lower = t;
      }
      t = (upper + lower) / 2;
    }

    return calcBezier(t, mY1, mY2);
  };
}

/** Accept an easing function or a `[x1, y1, x2, y2]` curve. */
export function normalizeEasing(easing?: EasingFunction | BezierCurve): EasingFunction {
  if (!easing) {
    return easeLinear;
  }
  return Array.isArray(easing) ? cubicBezier(...easing) : easing;
}
