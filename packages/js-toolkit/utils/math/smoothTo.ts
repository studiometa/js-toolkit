import { damp } from './damp.js';
import { spring } from './spring.js';
import { isFunction, isDefined } from '../is.js';

export type SmoothToOptions = Partial<{
  /**
   * Damping factor, the smaller the smoother, defaults to 0.6.
   */
  damping: number;
  /**
   * Precision used to decide when the smoothing should end, defaults to 1 / 1e8.
   */
  precision: number;
  /**
   * Enable spring physics, defaults to `true` if one of `stiffness` or `mass` is set, defaults to `false` otherwise.
   */
  spring: boolean;
  /**
   * Stiffness factor for spring physics, the higher the stiffer, defaults to 0.1.
   */
  stiffness: number;
  /**
   * Mass factor when spring is enabled, the higher the heavier, defaults to 1.
   */
  mass: number;
}>;

/**
 * Create a smoothing function that will smoothly tween between two values.
 * @param {number} [start] The initial value.
 * @param {SmoothToOptions} [options] Options for the transition.
 * @see https://js-toolkit.studiometa.dev/utils/math/smoothTo.html
 * @example
 * ```js
 * const x = smoothTo(0);
 * x.subscribe((value) => console.log(value));
 * x(100); // 0.1
 * ```
 */
export function smoothTo(start = 0, options: SmoothToOptions = {}) {
  const fns = new Set<(value: number) => any>();

  let damping = options.damping ?? 0.6;
  let precision = options.precision ?? 1 / 1e8;
  let stiffness = options.stiffness ?? 0.1;
  let mass = options.mass ?? 1;
  let isSpring = options.spring === true || isDefined(options.stiffness) || isDefined(options.mass);

  let value = start;
  let smoothed = start;
  let velocity = 0;

  /**
   * Callback for the useRaf service.
   */
  function tick() {
    if (isSpring) {
      [smoothed, velocity] = spring(value, smoothed, velocity, stiffness, damping, mass, precision);
    } else {
      smoothed = damp(value, smoothed, damping, precision);
    }

    for (const fn of fns) {
      fn(smoothed);
    }

    if (smoothed !== value) requestAnimationFrame(tick);
  }

  /**
   * Subscribe a callback to the value update.
   */
  function subscribe(fn: (value: number) => any) {
    if (isFunction(fn)) {
      fns.add(fn);
    }

    return () => unsubscribe(fn);
  }

  /**
   * Unsubscribe a callback to the value update.
   */
  function unsubscribe(fn: (value: number) => any) {
    return fns.delete(fn);
  }

  /**
   * Update the value if a parameter is given, get the value if no parameter is given.
   */
  function update(newValue?: number): number {
    if (!isDefined(newValue)) {
      return smoothed;
    }

    value = newValue;

    tick();

    return smoothed;
  }

  /**
   * Subscribe a callback to the value update.
   */
  update.subscribe = subscribe;

  /**
   * Unsubscribe a callback from the value update.
   */
  update.unsubscribe = unsubscribe;

  /**
   * Get the raw target value.
   */
  update.raw = () => value;
  /**
   * Get or set the damping factor.
   */
  update.damping = (val?: number) => (damping = val ?? damping);

  /**
   * Get or set the precision.
   */
  update.precision = (val?: number) => (precision = val ?? precision);

  /**
   * Get or set the stiffness factor.
   */
  update.stiffness = (val?: number) => (stiffness = val ?? stiffness);

  /**
   * Get or set the spring option.
   */
  update.spring = (val?: boolean) => (isSpring = val ?? isSpring);

  update(start);
  return update;
}
