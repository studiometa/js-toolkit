import { describe, expect, it } from 'vitest';
import { INERTIA_FRAME } from '../../src/math.js';
import { damp } from './math.js';

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

  it('handles a frame long enough to have been a stall', () => {
    // A backgrounded tab or a long task: the step is huge, and the value must
    // land on the target rather than overshoot past it.
    const value = damp(100, 0, 0.1, 5000);
    expect(value).toBeLessThanOrEqual(100);
    expect(value).toBeGreaterThan(99);
  });
});
