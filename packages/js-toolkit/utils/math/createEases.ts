export type EasingFunction = (progress: number) => number;

/**
 * Create an out easing function.
 *
 * @param   {EasingFunction} easeIn The ease in function.
 * @returns {EasingFunction}        The out function.
 */
export function createEaseOut(easeIn: EasingFunction): EasingFunction {
  return (progress) => 1 - easeIn(1 - progress);
}

/**
 * Create an in-out easing function.
 *
 * @param  {EasingFunction} easeIn The ease in function.
 * @returns {EasingFunction}        The in-out function.
 */
export function createEaseInOut(easeIn: EasingFunction): EasingFunction {
  /* eslint-disable no-nested-ternary */
  // eslint-disable-next-line no-confusing-arrow
  return (progress) =>
    progress === 0
      ? 0
      : progress === 1
        ? 1
        : progress < 0.5
          ? easeIn(progress * 2) / 2
          : 1 - easeIn((1 - progress) * 2) / 2;
}
