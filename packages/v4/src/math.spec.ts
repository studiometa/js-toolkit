import { describe, expect, it } from 'vitest';
import { clampDampFactor, DEFAULT_DAMP_FACTOR, inertiaFinalValue } from './math.js';

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

describe('inertiaFinalValue', () => {
  it('sums the whole coast rather than walking it', () => {
    // 100 + 100·0.5 + 100·0.25 … = 100 / (1 - 0.5) = 200.
    expect(inertiaFinalValue(0, 100, 0.5)).toBe(200);
    expect(inertiaFinalValue(50, 100, 0.5)).toBe(250);
  });

  it('is the position a step-by-step coast converges on', () => {
    let value = 0;
    let delta = 100;
    for (let index = 0; index < 400; index += 1) {
      value += delta;
      delta *= 0.85;
    }
    expect(inertiaFinalValue(0, 100, 0.85)).toBeCloseTo(value, 6);
  });

  it('does not move when there is no velocity', () => {
    expect(inertiaFinalValue(25, 0, 0.85)).toBe(25);
  });

  it('travels exactly one delta when nothing decays', () => {
    expect(inertiaFinalValue(0, 100, 0)).toBe(100);
  });

  it('guards its own factor, so no caller can make it diverge', () => {
    expect(Number.isFinite(inertiaFinalValue(0, 100, 1))).toBe(true);
    expect(Number.isFinite(inertiaFinalValue(0, 100, Number.NaN))).toBe(true);
  });
});
