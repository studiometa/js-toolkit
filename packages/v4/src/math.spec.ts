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
} from './math.js';

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
      for (let elapsed = 0; elapsed < 40_000; ) {
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
