/**
 * The maths the framework itself needs. Not a port of
 * `@studiometa/js-toolkit/utils/math` — only what `src/` reaches for, so that
 * a service does not carry a formula of its own.
 */

/** The inertia factor when none is given: v3's value. */
export const DEFAULT_DAMP_FACTOR = 0.85;

/**
 * The frame a damping factor is expressed against, in milliseconds — one frame
 * at 60 Hz.
 *
 * A factor on its own is a number per *step*, which only means something if
 * every step is the same length. Frames are not: 60 Hz, 120 Hz and a stutter
 * all deliver different ones. Anchoring the factor to this reference is what
 * lets an elapsed time be converted into the decay that belongs to it, so
 * `0.85` keeps meaning the same physical decay wherever it runs.
 */
export const INERTIA_FRAME = 1000 / 60;

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
 * How much of a quantity survives `elapsed` milliseconds, given the fraction
 * `retained` per {@link INERTIA_FRAME}.
 *
 * `retained^(elapsed / INERTIA_FRAME)`: one reference frame of elapsed time is
 * one application of the fraction, half a frame is half an application. This is
 * the whole of frame-rate independence for a first-order decay — applying the
 * fraction once per frame instead ties the result to the display, so the same
 * animation runs twice as fast on a 120 Hz screen.
 *
 * `retained` is clamped to `[0, 1]`, which is the only range that decays: above
 * `1` a quantity grows without end, and below `0` it changes sign every step.
 * Both ends are meaningful — `0` retains nothing, `1` retains everything and
 * never moves — so neither is excluded.
 *
 * A non-finite input yields `0` rather than `NaN`. Retaining nothing is the
 * safe reading: a caller lands on its target, or stops, instead of poisoning
 * every value that touches the result from then on.
 */
export function decayOver(retained: number, elapsed: number): number {
  if (!Number.isFinite(retained) || !Number.isFinite(elapsed)) {
    return 0;
  }
  return Math.min(Math.max(retained, 0), 1) ** (elapsed / INERTIA_FRAME);
}

/**
 * How much of a velocity survives `elapsed` milliseconds of decay.
 *
 * {@link decayOver} with the tighter clamp the inertia needs: a factor of `1`
 * has to be excluded here, because {@link inertiaTimeConstant} divides by
 * `ln(1 / damp)` and a coast that never decays has no finite destination. That
 * restriction belongs to the inertia rather than to decay in general.
 *
 * It is also what a *pause* costs. A velocity measured 200 ms ago is not the
 * velocity now, and running it through the law the coast already obeys is
 * truer than picking a staleness threshold: at `0.85` a 200 ms pause leaves
 * 14% of it, and a long one leaves nothing.
 */
export function inertiaDecay(dampFactor: number, elapsed: number): number {
  return decayOver(clampDampFactor(dampFactor), elapsed);
}

/**
 * How long the decay takes to run out, in milliseconds — the time constant of
 * `inertiaDecay()`.
 *
 * `τ = INERTIA_FRAME / ln(1 / damp)`. A velocity decaying as `v·damp^(t/FRAME)`
 * covers `v · τ` before it stops, which is the integral of the whole coast.
 *
 * `damp = 0` gives `ln(1/0) = Infinity` and therefore `τ = 0`: nothing decays
 * because nothing coasts. The upper clamp keeps the other end finite.
 */
export function inertiaTimeConstant(dampFactor: number): number {
  return INERTIA_FRAME / Math.log(1 / clampDampFactor(dampFactor));
}

/**
 * How far a coast travels in one step of `elapsed` milliseconds, given its
 * velocity in **pixels per millisecond**.
 *
 * `v · τ · (1 - decay)` — the integral of the decay across the step, not
 * `v · elapsed`.
 *
 * That difference is the whole point, and it is easy to get wrong: `v ·
 * elapsed` is a left rectangle sum over a curve that falls throughout the
 * step, so it overshoots, and it overshoots *by an amount that depends on the
 * step*. Decaying exponentially but integrating by rectangles still leaves a
 * 60 Hz coast and a 120 Hz coast landing 4% apart, and leaves neither of them
 * on {@link inertiaFinalValue}. Integrating exactly telescopes: whatever
 * sequence of steps the display happens to deliver, the total is `v · τ` and
 * the destination announced at the drop is the one the coast arrives at.
 *
 * Read another way, each step covers a fixed *fraction* of the travel that is
 * left, and time decides the fraction.
 */
export function inertiaStep(velocity: number, dampFactor: number, elapsed: number): number {
  return velocity * inertiaTimeConstant(dampFactor) * (1 - inertiaDecay(dampFactor, elapsed));
}

/**
 * Where a coast ends up, given the velocity it is released with in **pixels
 * per millisecond**.
 *
 * `value + velocity · τ` — the integral of the decay, so it is exact rather
 * than a walk of the decay term by term until a term falls under some epsilon.
 *
 * It is also an **invariant** along the coast: after any step the value has
 * gained {@link inertiaStep} and the velocity has lost exactly that much of
 * its remaining travel, which lands on the same number. So the destination is
 * knowable the moment the gesture is released — which is what lets a consumer
 * animate straight to the resting position, or hand it to a CSS transition,
 * instead of following every frame — and a coast can snap onto it at the end
 * rather than stop a fraction short.
 *
 * The velocity is per millisecond and not per frame on purpose: per frame is
 * the quantity that changes meaning with the display, and it is what made the
 * same gesture throw differently on a 1000 Hz mouse and a 125 Hz trackpad.
 */
export function inertiaFinalValue(value: number, velocity: number, dampFactor: number): number {
  return value + velocity * inertiaTimeConstant(dampFactor);
}
