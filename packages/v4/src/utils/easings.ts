/**
 * Easing functions: they shape a `0 → 1` progress and answer in the same
 * range. The `in` form is the source, and the `out` and `in-out` forms are
 * derived from it.
 */

/** Takes a progress between `0` and `1`, answers an eased value in that range. */
export type EasingFunction = (progress: number) => number;

/** Mirror an ease-in function into its ease-out counterpart. */
export function createEaseOut(easeIn: EasingFunction): EasingFunction {
  return (progress) => 1 - easeIn(1 - progress);
}

/** Join an ease-in function with its mirror, each over half the progress. */
export function createEaseInOut(easeIn: EasingFunction): EasingFunction {
  return (progress) => {
    if (progress === 0 || progress === 1) return progress;
    return progress < 0.5 ? easeIn(progress * 2) / 2 : 1 - easeIn((1 - progress) * 2) / 2;
  };
}

/** No easing: the progress is the value. */
export function easeLinear(progress: number): number {
  return progress;
}

export function easeInQuad(progress: number): number {
  return progress ** 2;
}

export const easeOutQuad = /* @__PURE__ */ createEaseOut(easeInQuad);
export const easeInOutQuad = /* @__PURE__ */ createEaseInOut(easeInQuad);

export function easeInCubic(progress: number): number {
  return progress ** 3;
}

export const easeOutCubic = /* @__PURE__ */ createEaseOut(easeInCubic);
export const easeInOutCubic = /* @__PURE__ */ createEaseInOut(easeInCubic);

export function easeInQuart(progress: number): number {
  return progress ** 4;
}

export const easeOutQuart = /* @__PURE__ */ createEaseOut(easeInQuart);
export const easeInOutQuart = /* @__PURE__ */ createEaseInOut(easeInQuart);

export function easeInQuint(progress: number): number {
  return progress ** 5;
}

export const easeOutQuint = /* @__PURE__ */ createEaseOut(easeInQuint);
export const easeInOutQuint = /* @__PURE__ */ createEaseInOut(easeInQuint);

export function easeInSine(progress: number): number {
  // Exact at the end, which the cosine is not.
  return progress === 1 ? 1 : 1 - Math.cos((progress * Math.PI) / 2);
}

export const easeOutSine = /* @__PURE__ */ createEaseOut(easeInSine);
export const easeInOutSine = /* @__PURE__ */ createEaseInOut(easeInSine);

export function easeInCirc(progress: number): number {
  return 1 - Math.sqrt(1 - progress * progress);
}

export const easeOutCirc = /* @__PURE__ */ createEaseOut(easeInCirc);
export const easeInOutCirc = /* @__PURE__ */ createEaseInOut(easeInCirc);

export function easeInExpo(progress: number): number {
  // Exact at the start, where the power would answer 1/1024.
  return progress === 0 ? 0 : 2 ** (10 * (progress - 1));
}

export const easeOutExpo = /* @__PURE__ */ createEaseOut(easeInExpo);
export const easeInOutExpo = /* @__PURE__ */ createEaseInOut(easeInExpo);
