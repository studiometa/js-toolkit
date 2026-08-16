import { describe, expect, it } from 'vitest';
import {
  clampDampFactor,
  decayOver,
  DEFAULT_DAMP_FACTOR,
  inertiaDecay,
  inertiaFinalValue,
  inertiaStep,
  inertiaTimeConstant,
  INERTIA_FRAME,
  damp,
  MAX_SPRING_RATIO,
  spring,
} from './maths.js';

describe('clampDampFactor', () => {
  it('keeps a usable factor as it is', () => {
    expect(clampDampFactor(0.85)).toBe(0.85);
    expect(clampDampFactor(0)).toBe(0);
  });

  it('never returns 1, which would never decay', () => {
    expect(clampDampFactor(1)).toBeLessThan(1);
    expect(clampDampFactor(42)).toBeLessThan(1);
  });

  it('never returns a negative factor, which would flip sign every step', () => {
    expect(clampDampFactor(-0.5)).toBe(0);
  });

  it('falls back to the default rather than spreading a non-finite factor', () => {
    expect(clampDampFactor(Number.NaN)).toBe(DEFAULT_DAMP_FACTOR);
    expect(clampDampFactor(Number.POSITIVE_INFINITY)).toBe(DEFAULT_DAMP_FACTOR);
  });
});

describe('decayOver', () => {
  it('applies the retained fraction once per reference frame', () => {
    expect(decayOver(0.9, INERTIA_FRAME)).toBeCloseTo(0.9, 10);
    expect(decayOver(0.9, INERTIA_FRAME * 2)).toBeCloseTo(0.81, 10);
    expect(decayOver(0.9, INERTIA_FRAME / 2)).toBeCloseTo(Math.sqrt(0.9), 10);
  });

  it('composes, which is what frame-rate independence means', () => {
    const half = decayOver(0.9, INERTIA_FRAME / 2);
    expect(half * half).toBeCloseTo(decayOver(0.9, INERTIA_FRAME), 10);
  });

  it('keeps both ends of the range, because both mean something', () => {
    expect(decayOver(1, INERTIA_FRAME * 100)).toBe(1);
    expect(decayOver(0, INERTIA_FRAME)).toBe(0);
  });

  it('refuses a fraction that would not decay', () => {
    expect(decayOver(4, INERTIA_FRAME)).toBe(1);
    expect(decayOver(-2, INERTIA_FRAME)).toBe(0);
  });

  it('treats a negative duration as no time at all', () => {
    expect(decayOver(0.9, -INERTIA_FRAME)).toBe(1);
    expect(decayOver(0.9, -10_000)).toBe(1);
    expect(decayOver(0.9, -0)).toBe(1);
  });

  it('retains nothing rather than returning NaN', () => {
    expect(decayOver(Number.NaN, INERTIA_FRAME)).toBe(0);
    expect(decayOver(0.9, Number.NaN)).toBe(0);
    expect(decayOver(0.9, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('inertiaDecay', () => {
  it('applies the factor once per reference frame', () => {
    expect(inertiaDecay(0.85, INERTIA_FRAME)).toBeCloseTo(0.85, 10);
    expect(inertiaDecay(0.85, INERTIA_FRAME * 2)).toBeCloseTo(0.85 ** 2, 10);
    expect(inertiaDecay(0.85, INERTIA_FRAME / 2)).toBeCloseTo(Math.sqrt(0.85), 10);
  });

  it('leaves everything when no time passed', () => {
    expect(inertiaDecay(0.85, 0)).toBe(1);
  });

  it('costs a pause what the coast would have cost it', () => {
    expect(inertiaDecay(0.85, 200)).toBeCloseTo(0.14, 2);
    expect(inertiaDecay(0.85, 2000)).toBeLessThan(0.001);
  });

  it('never survives an undamped factor', () => {
    expect(inertiaDecay(0, INERTIA_FRAME)).toBe(0);
  });
});

describe('inertiaTimeConstant', () => {
  it('is zero when nothing coasts', () => {
    expect(inertiaTimeConstant(0)).toBe(0);
  });

  it('stays finite at the top of the range', () => {
    expect(Number.isFinite(inertiaTimeConstant(1))).toBe(true);
    expect(inertiaTimeConstant(1)).toBeGreaterThan(0);
  });

  it('grows as the damping approaches 1', () => {
    expect(inertiaTimeConstant(0.95)).toBeGreaterThan(inertiaTimeConstant(0.85));
  });
});

describe('inertiaFinalValue', () => {
  it('is the velocity integrated over the decay', () => {
    expect(inertiaFinalValue(0, 1, 0.85)).toBeCloseTo(inertiaTimeConstant(0.85), 10);
    expect(inertiaFinalValue(50, 2, 0.85)).toBeCloseTo(50 + 2 * inertiaTimeConstant(0.85), 10);
  });

  it('does not move without a velocity, or without damping', () => {
    expect(inertiaFinalValue(25, 0, 0.85)).toBe(25);
    expect(inertiaFinalValue(25, 4, 0)).toBe(25);
  });

  it('guards its own factor, so no caller can make it diverge', () => {
    expect(Number.isFinite(inertiaFinalValue(0, 1, 1))).toBe(true);
    expect(Number.isFinite(inertiaFinalValue(0, 1, Number.NaN))).toBe(true);
  });

  it('is where a stepped coast actually arrives', () => {
    let value = 0;
    let velocity = 3;
    const dt = INERTIA_FRAME;
    for (let index = 0; index < 2000; index += 1) {
      value += inertiaStep(velocity, 0.85, dt);
      velocity *= inertiaDecay(0.85, dt);
    }
    expect(value).toBeCloseTo(inertiaFinalValue(0, 3, 0.85), 6);
  });

  it('arrives at the same place whatever the display does', () => {
    const coast = (steps: () => number) => {
      let value = 0;
      let velocity = 3;
      for (let elapsed = 0; elapsed < 40_000;) {
        const dt = steps();
        value += inertiaStep(velocity, 0.85, dt);
        velocity *= inertiaDecay(0.85, dt);
        elapsed += dt;
      }
      return value;
    };

    const exact = inertiaFinalValue(0, 3, 0.85);
    expect(coast(() => INERTIA_FRAME)).toBeCloseTo(exact, 6);
    expect(coast(() => INERTIA_FRAME / 2)).toBeCloseTo(exact, 6);
    expect(coast(() => INERTIA_FRAME * 2)).toBeCloseTo(exact, 6);

    const uneven = [8, 17, 41, 9, 33, 16];
    let index = 0;
    expect(
      coast(() => {
        index += 1;
        return uneven[index % uneven.length];
      }),
    ).toBeCloseTo(exact, 6);
  });
});

/** Close on a target for `duration` ms, in steps of `dt`. */
function settle(dt: number, factor = 0.1, duration = 10_000, precision = 0.01) {
  let value = 0;
  let steps = 0;
  for (let elapsed = 0; elapsed < duration && value !== 100; elapsed += dt) {
    value = damp(100, value, factor, dt, precision);
    steps += 1;
  }
  return { value, steps, realTime: steps * dt };
}

describe('damp', () => {
  it('takes the same real time at 60 Hz, 120 Hz and 30 Hz', () => {
    const at60 = settle(INERTIA_FRAME);
    const at120 = settle(INERTIA_FRAME / 2);
    const at30 = settle(INERTIA_FRAME * 2);

    expect(at60.value).toBe(100);
    expect(at120.value).toBe(100);
    expect(at30.value).toBe(100);

    expect(Math.abs(at120.realTime - at60.realTime)).toBeLessThan(INERTIA_FRAME * 2);
    expect(Math.abs(at30.realTime - at60.realTime)).toBeLessThan(INERTIA_FRAME * 2);
    expect(at120.steps).toBeGreaterThan(at60.steps * 1.5);
  });

  it('lands in the same place after the same elapsed time, mid-flight', () => {
    const oneStep = damp(100, 0, 0.1, INERTIA_FRAME);
    let twoHalves = damp(100, 0, 0.1, INERTIA_FRAME / 2);
    twoHalves = damp(100, twoHalves, 0.1, INERTIA_FRAME / 2);

    expect(twoHalves).toBeCloseTo(oneStep, 10);
  });

  it('closes the stated fraction of the gap in one reference frame', () => {
    expect(damp(100, 0, 0.1, INERTIA_FRAME)).toBeCloseTo(10, 10);
    expect(damp(100, 0, 0.5, INERTIA_FRAME)).toBeCloseTo(50, 10);
  });

  it('snaps onto the target rather than approaching it forever', () => {
    expect(damp(100, 99.9999, 0.1, INERTIA_FRAME, 0.01)).toBe(100);
  });

  it('does not move when nothing is asked of it', () => {
    expect(damp(100, 50, 0, INERTIA_FRAME, 0)).toBe(50);
    expect(damp(100, 50, 0.1, 0, 0)).toBe(50);
  });

  it('stays stable for factors v3 diverged on', () => {
    expect(damp(100, 0, 2, INERTIA_FRAME)).toBe(100);
    expect(damp(100, 0, 10, INERTIA_FRAME)).toBe(100);

    let value = 0;
    for (let step = 0; step < 20; step += 1) {
      value = damp(100, value, 3, INERTIA_FRAME);
    }
    expect(value).toBe(100);
  });

  it('never returns a value a caller cannot use', () => {
    expect(Number.isFinite(damp(100, 0, Number.NaN, INERTIA_FRAME))).toBe(true);
    expect(Number.isFinite(damp(100, 0, 0.1, Number.NaN))).toBe(true);
    expect(Number.isFinite(damp(100, 0, -1, INERTIA_FRAME))).toBe(true);
  });

  it('holds still rather than running away on a negative elapsed', () => {
    expect(damp(100, 0, 0.1, -INERTIA_FRAME)).toBe(0);
    expect(damp(100, 0, 0.1, -10_000)).toBe(0);
  });

  it('handles a frame long enough to have been a stall', () => {
    const value = damp(100, 0, 0.1, 5000);
    expect(value).toBeLessThanOrEqual(100);
    expect(value).toBeGreaterThan(99);
  });
});

/** Run a spring to rest in steps of `dt`, reporting the real time it took. */
function settleSpring(dt: number, target = 100) {
  let value = 0;
  let velocity = 0;
  let peak = 0;
  let elapsed = 0;
  while (value !== target && elapsed < 20_000) {
    [value, velocity] = spring(target, value, velocity, dt);
    peak = Math.max(peak, value);
    elapsed += dt;
  }
  return { value, peak, elapsed };
}

describe('spring', () => {
  it('takes the same real time whatever the display delivers', () => {
    const at60 = settleSpring(INERTIA_FRAME);
    const at120 = settleSpring(INERTIA_FRAME / 2);
    const at30 = settleSpring(INERTIA_FRAME * 2);

    expect(at60.value).toBe(100);
    expect(at120.value).toBe(100);
    expect(at30.value).toBe(100);

    expect(Math.abs(at120.elapsed - at60.elapsed)).toBeLessThan(INERTIA_FRAME * 3);
    expect(Math.abs(at30.elapsed - at60.elapsed)).toBeLessThan(INERTIA_FRAME * 3);
  });

  it('keeps the same overshoot whatever the display delivers', () => {
    const at60 = settleSpring(INERTIA_FRAME);
    const at120 = settleSpring(INERTIA_FRAME / 2);
    expect(at120.peak).toBeCloseTo(at60.peak, 0);
    expect(at60.peak).toBeGreaterThan(100);
  });

  it('survives the stiffness that made v3 diverge', () => {
    for (const stiffness of [1.9, 4, 40, 400, 4000, 1e9]) {
      let value = 0;
      let velocity = 0;
      for (let step = 0; step < 400; step += 1) {
        [value, velocity] = spring(100, value, velocity, INERTIA_FRAME, { stiffness });
      }
      expect(Number.isFinite(value)).toBe(true);
      expect(Math.abs(value)).toBeLessThan(1000);
    }
  });

  it('clamps a stiffness the step cannot integrate, rather than exploding', () => {
    const atLimit = spring(100, 0, 0, INERTIA_FRAME, { stiffness: MAX_SPRING_RATIO });
    const wayOver = spring(100, 0, 0, INERTIA_FRAME, { stiffness: 1e6 });
    expect(wayOver[0]).toBeCloseTo(atLimit[0], 6);
    expect(Number.isFinite(wayOver[0])).toBe(true);

    expect(Number.isFinite(spring(100, 0, 0, INERTIA_FRAME, { mass: 0 })[0])).toBe(true);
    expect(Number.isFinite(spring(100, 0, 0, INERTIA_FRAME, { mass: Number.NaN })[0])).toBe(true);
  });

  it('reaches rest exactly, so a caller can compare against the target', () => {
    const [value, velocity] = spring(100, 99.99999, 0.000001, INERTIA_FRAME);
    expect(value).toBe(100);
    expect(velocity).toBe(0);
  });

  it('does not move on a step that is no time at all', () => {
    expect(spring(100, 20, 5, 0)).toEqual([20, 5]);
    expect(spring(100, 20, 5, -100)).toEqual([20, 5]);
    expect(spring(100, 20, 5, Number.NaN)).toEqual([20, 5]);
  });

  it('bounds the work a returning tab can ask for', () => {
    const [value, velocity] = spring(100, 0, 0, 600_000);
    expect(Number.isFinite(value)).toBe(true);
    expect(Number.isFinite(velocity)).toBe(true);
  });

  it('is stiffer with more stiffness and slower with more mass', () => {
    const stiff = settleSpring(INERTIA_FRAME);
    let value = 0;
    let velocity = 0;
    let elapsed = 0;
    while (value !== 100 && elapsed < 20_000) {
      [value, velocity] = spring(100, value, velocity, INERTIA_FRAME, { mass: 4 });
      elapsed += INERTIA_FRAME;
    }
    expect(elapsed).toBeGreaterThan(stiff.elapsed);
  });
});
