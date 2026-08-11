/**
 * Easing helpers.
 *
 * v3 imports `cubicBezier` from `@motionone/easing`, which is the only third
 * party dependency the `animate` chain pulls in. v4 has none, so the curve is
 * solved here with the usual Newton–Raphson pass and a bisection fallback —
 * about thirty lines against a package.
 */

export type EasingFunction = (progress: number) => number;
export type BezierCurve = [number, number, number, number];

const SUBDIVISION_PRECISION = 1e-7;
const SUBDIVISION_MAX_ITERATIONS = 12;

function calcBezier(t: number, a1: number, a2: number): number {
  return (((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t + 3 * a1) * t;
}

export function linear(progress: number): number {
  return progress;
}

/**
 * Build the easing function for a CSS-style cubic bezier curve.
 */
export function cubicBezier(mX1: number, mY1: number, mX2: number, mY2: number): EasingFunction {
  if (mX1 === mY1 && mX2 === mY2) {
    return linear;
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

/**
 * Accept either a function or a `[x1, y1, x2, y2]` curve, as v3's
 * `normalizeEase` does.
 */
export function normalizeEasing(easing?: EasingFunction | BezierCurve): EasingFunction {
  if (!easing) {
    return linear;
  }
  return Array.isArray(easing) ? cubicBezier(...easing) : easing;
}
