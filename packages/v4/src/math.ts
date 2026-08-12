/**
 * The maths the framework itself needs. Not a port of
 * `@studiometa/js-toolkit/utils/math` — only what `src/` reaches for, so that
 * a service does not carry a formula of its own.
 */

/** The inertia factor when none is given: v3's value. */
export const DEFAULT_DAMP_FACTOR = 0.85;

/**
 * A damping factor that is safe to decay by and to sum.
 *
 * `1` never decays, so a coast driven by it would never end and its settle
 * position would be infinitely far away. Below `0` the sign flips every frame.
 * A non-finite factor — an unparsed `data-option-damp-factor`, a division that
 * went wrong — falls back to the default rather than poisoning every frame
 * with `NaN`.
 *
 * Clamped here rather than at each call site so that no caller can reach the
 * formulas below with a factor they do not accept.
 */
export function clampDampFactor(factor: number): number {
  if (!Number.isFinite(factor)) {
    return DEFAULT_DAMP_FACTOR;
  }
  return Math.min(Math.max(factor, 0), 0.99999);
}

/**
 * Where a damped value ends up once its delta has decayed to nothing.
 *
 * A coast adds `delta`, then `delta · damp`, then `delta · damp²`…, so the
 * travel left is the geometric sum `delta / (1 - damp)`: one division, rather
 * than walking the decay term by term until a term falls under some epsilon.
 *
 * It is also an **invariant** along the coast — after a step the value has
 * gained `delta` and `delta` has been scaled by `damp`, which lands on the
 * same number — so the destination is knowable at the moment the gesture is
 * released, and a coast can snap onto it at the end rather than settle near
 * it. That is what lets a consumer animate straight to the resting position
 * instead of following every frame.
 */
export function inertiaFinalValue(value: number, delta: number, dampFactor: number): number {
  return value + delta / (1 - clampDampFactor(dampFactor));
}
