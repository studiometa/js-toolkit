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
    // An unparsed option, or a division that went wrong: one `NaN` here would
    // otherwise poison every frame of the coast.
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
    // Two half-frames are one frame, so a stuttering display cannot change the
    // result — only how many steps it takes to get there.
    const half = decayOver(0.9, INERTIA_FRAME / 2);
    expect(half * half).toBeCloseTo(decayOver(0.9, INERTIA_FRAME), 10);
  });

  it('keeps both ends of the range, because both mean something', () => {
    // `1` holds still and `0` retains nothing. `inertiaDecay()` excludes `1`
    // for its own reason; decay in general must not.
    expect(decayOver(1, INERTIA_FRAME * 100)).toBe(1);
    expect(decayOver(0, INERTIA_FRAME)).toBe(0);
  });

  it('refuses a fraction that would not decay', () => {
    // Above 1 a value grows without end; below 0 it changes sign every step.
    expect(decayOver(4, INERTIA_FRAME)).toBe(1);
    expect(decayOver(-2, INERTIA_FRAME)).toBe(0);
  });

  it('treats a negative duration as no time at all', () => {
    // Time runs one way. A negative elapsed does not decay less, it decays
    // *backwards* — `0.9 ** -60` is an amplification, not a survival rate — so
    // unguarded it turns a flick into a launch and makes `damp()` run away from
    // its target. A negative elapsed means two clocks disagreed; retaining
    // everything is the only reading that cannot make it worse.
    expect(decayOver(0.9, -INERTIA_FRAME)).toBe(1);
    expect(decayOver(0.9, -10_000)).toBe(1);
    expect(decayOver(0.9, -0)).toBe(1);
  });

  it('retains nothing rather than returning NaN', () => {
    // One `NaN` here would otherwise reach every value that touches the result.
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
    // The reason there is no staleness threshold anywhere: a velocity measured
    // 200 ms ago has already decayed, by the law the coast itself obeys.
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
    // Walk the decay the way the service does, and land on the closed form.
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
    // The whole point. Same flick, different frame budget: the per-frame decay
    // this replaces made the 120 Hz coast travel half as far, and integrating
    // by rectangles still left the two 4% apart.
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

    // Not just uniform steps: a stuttering display has to land there too, which
    // is what "exact per step" buys over "small enough steps".
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
    // The defect this replaces, measured on the v3 helper: `factor` was applied
    // per call, so the same damping settled in 56 frames at 60 Hz and 28 at
    // 120 Hz — twice as fast on a better screen.
    const at60 = settle(INERTIA_FRAME);
    const at120 = settle(INERTIA_FRAME / 2);
    const at30 = settle(INERTIA_FRAME * 2);

    // Every run has to have actually arrived, or this compares loop bounds.
    expect(at60.value).toBe(100);
    expect(at120.value).toBe(100);
    expect(at30.value).toBe(100);

    // Within one coarse step of each other, which is the granularity available.
    expect(Math.abs(at120.realTime - at60.realTime)).toBeLessThan(INERTIA_FRAME * 2);
    expect(Math.abs(at30.realTime - at60.realTime)).toBeLessThan(INERTIA_FRAME * 2);
    // And it really is running at different rates, not accidentally equal.
    expect(at120.steps).toBeGreaterThan(at60.steps * 1.5);
  });

  it('lands in the same place after the same elapsed time, mid-flight', () => {
    const oneStep = damp(100, 0, 0.1, INERTIA_FRAME);
    let twoHalves = damp(100, 0, 0.1, INERTIA_FRAME / 2);
    twoHalves = damp(100, twoHalves, 0.1, INERTIA_FRAME / 2);

    // Two half-frames are one frame. This is the property the whole change is
    // for, and it is what `factor` applied per call could not give.
    expect(twoHalves).toBeCloseTo(oneStep, 10);
  });

  it('closes the stated fraction of the gap in one reference frame', () => {
    expect(damp(100, 0, 0.1, INERTIA_FRAME)).toBeCloseTo(10, 10);
    expect(damp(100, 0, 0.5, INERTIA_FRAME)).toBeCloseTo(50, 10);
  });

  it('snaps onto the target rather than approaching it forever', () => {
    // Exponential decay never arrives; the precision is what ends it, and the
    // result has to be the target exactly so a caller can compare against it.
    expect(damp(100, 99.9999, 0.1, INERTIA_FRAME, 0.01)).toBe(100);
  });

  it('does not move when nothing is asked of it', () => {
    expect(damp(100, 50, 0, INERTIA_FRAME, 0)).toBe(50);
    expect(damp(100, 50, 0.1, 0, 0)).toBe(50);
  });

  it('stays stable for factors v3 diverged on', () => {
    // v3 oscillated forever at 2 — the gap flipped sign with the same
    // magnitude — and diverged above it. Over-large now means "close all of
    // it", which is the only stable reading.
    expect(damp(100, 0, 2, INERTIA_FRAME)).toBe(100);
    expect(damp(100, 0, 10, INERTIA_FRAME)).toBe(100);

    // And it cannot be walked away from: repeated steps stay put on the target.
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
    // What the amplification did through `damp`: -11.11 for one backwards
    // frame, and -5.55e4 for a second of it. Both moved away from the target.
    expect(damp(100, 0, 0.1, -INERTIA_FRAME)).toBe(0);
    expect(damp(100, 0, 0.1, -10_000)).toBe(0);
  });

  it('handles a frame long enough to have been a stall', () => {
    // A backgrounded tab or a long task: the step is huge, and the value must
    // land on the target rather than overshoot past it.
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
    // The defect, measured on the v3 helper: no notion of time, so the same
    // spring settled in 56 frames at 60 Hz and 28 at 120 Hz.
    const at60 = settleSpring(INERTIA_FRAME);
    const at120 = settleSpring(INERTIA_FRAME / 2);
    const at30 = settleSpring(INERTIA_FRAME * 2);

    expect(at60.value).toBe(100);
    expect(at120.value).toBe(100);
    expect(at30.value).toBe(100);

    // Within a couple of coarse frames of each other, where v3 was a factor of
    // two apart.
    expect(Math.abs(at120.elapsed - at60.elapsed)).toBeLessThan(INERTIA_FRAME * 3);
    expect(Math.abs(at30.elapsed - at60.elapsed)).toBeLessThan(INERTIA_FRAME * 3);
  });

  it('keeps the same overshoot whatever the display delivers', () => {
    // A rate change preserves the shape, which is why v3's peak was identical
    // at both rates while its duration halved. Here both have to match.
    const at60 = settleSpring(INERTIA_FRAME);
    const at120 = settleSpring(INERTIA_FRAME / 2);
    expect(at120.peak).toBeCloseTo(at60.peak, 0);
    // And it is a spring: it goes past the target before coming back.
    expect(at60.peak).toBeGreaterThan(100);
  });

  it('survives the stiffness that made v3 diverge', () => {
    // v3 integrated with a step it could not see: 1.9 overshot to 190 and 4 ran
    // away to -1.6e15. A fixed step is most of the answer but not all of it —
    // semi-implicit Euler explodes above a ratio the step cannot carry — so the
    // ratio is clamped to it. Nothing here may run away.
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
    // Above the ratio the two are indistinguishable, which is the point: both
    // arrive inside a frame, and neither diverges.
    const atLimit = spring(100, 0, 0, INERTIA_FRAME, { stiffness: MAX_SPRING_RATIO });
    const wayOver = spring(100, 0, 0, INERTIA_FRAME, { stiffness: 1e6 });
    expect(wayOver[0]).toBeCloseTo(atLimit[0], 6);
    expect(Number.isFinite(wayOver[0])).toBe(true);

    // Mass is the other half of the ratio, so it has to be guarded too.
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
    // A backgrounded tab hands back a huge elapsed time. It costs iterations,
    // and they are capped: the spring does not spend the frame replaying time
    // nobody watched, and it certainly does not blow up.
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
    // The parameters still mean what they meant; only time became real.
    expect(elapsed).toBeGreaterThan(stiff.elapsed);
  });
});
