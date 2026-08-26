/**
 * Easing functions: they shape a `0 → 1` progress and answer in the same
 * range. The `in` form is the source, and the `out` and `in-out` forms are
 * derived from it.
 */

/** Takes a progress between `0` and `1`, answers an eased value in that range. */
export type EasingFunction = (progress: number) => number;

/**
 * Mirror an ease-in function into its ease-out counterpart.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#createeaseout
 */
export function createEaseOut(easeIn: EasingFunction): EasingFunction {
  return (progress) => 1 - easeIn(1 - progress);
}

/**
 * Join an ease-in function with its mirror, each over half the progress.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#createeaseinout
 */
export function createEaseInOut(easeIn: EasingFunction): EasingFunction {
  return (progress) => {
    if (progress === 0 || progress === 1) return progress;
    return progress < 0.5 ? easeIn(progress * 2) / 2 : 1 - easeIn((1 - progress) * 2) / 2;
  };
}

/**
 * No easing: the progress is the value.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easelinear
 */
export function easeLinear(progress: number): number {
  return progress;
}

/**
 * Quadratic ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinquad
 */
export function easeInQuad(progress: number): number {
  return progress ** 2;
}

/**
 * Quadratic ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutquad
 */
export const easeOutQuad = /* @__PURE__ */ createEaseOut(easeInQuad);
/**
 * Quadratic ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutquad
 */
export const easeInOutQuad = /* @__PURE__ */ createEaseInOut(easeInQuad);

/**
 * Cubic ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeincubic
 */
export function easeInCubic(progress: number): number {
  return progress ** 3;
}

/**
 * Cubic ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutcubic
 */
export const easeOutCubic = /* @__PURE__ */ createEaseOut(easeInCubic);
/**
 * Cubic ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutcubic
 */
export const easeInOutCubic = /* @__PURE__ */ createEaseInOut(easeInCubic);

/**
 * Quartic ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinquart
 */
export function easeInQuart(progress: number): number {
  return progress ** 4;
}

/**
 * Quartic ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutquart
 */
export const easeOutQuart = /* @__PURE__ */ createEaseOut(easeInQuart);
/**
 * Quartic ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutquart
 */
export const easeInOutQuart = /* @__PURE__ */ createEaseInOut(easeInQuart);

/**
 * Quintic ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinquint
 */
export function easeInQuint(progress: number): number {
  return progress ** 5;
}

/**
 * Quintic ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutquint
 */
export const easeOutQuint = /* @__PURE__ */ createEaseOut(easeInQuint);
/**
 * Quintic ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutquint
 */
export const easeInOutQuint = /* @__PURE__ */ createEaseInOut(easeInQuint);

/**
 * Sinusoidal ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinsine
 */
export function easeInSine(progress: number): number {
  // Exact at the end, which the cosine is not.
  return progress === 1 ? 1 : 1 - Math.cos((progress * Math.PI) / 2);
}

/**
 * Sinusoidal ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutsine
 */
export const easeOutSine = /* @__PURE__ */ createEaseOut(easeInSine);
/**
 * Sinusoidal ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutsine
 */
export const easeInOutSine = /* @__PURE__ */ createEaseInOut(easeInSine);

/**
 * Circular ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeincirc
 */
export function easeInCirc(progress: number): number {
  return 1 - Math.sqrt(1 - progress * progress);
}

/**
 * Circular ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutcirc
 */
export const easeOutCirc = /* @__PURE__ */ createEaseOut(easeInCirc);
/**
 * Circular ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutcirc
 */
export const easeInOutCirc = /* @__PURE__ */ createEaseInOut(easeInCirc);

/**
 * Exponential ease-in.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinexpo
 */
export function easeInExpo(progress: number): number {
  // Exact at the start, where the power would answer 1/1024.
  return progress === 0 ? 0 : 2 ** (10 * (progress - 1));
}

/**
 * Exponential ease-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeoutexpo
 */
export const easeOutExpo = /* @__PURE__ */ createEaseOut(easeInExpo);
/**
 * Exponential ease-in-out.
 * @link https://js-toolkit-v4.studiometa.dev/utils/easings.html#easeinoutexpo
 */
export const easeInOutExpo = /* @__PURE__ */ createEaseInOut(easeInExpo);
