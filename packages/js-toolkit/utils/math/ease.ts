import { createEaseOut, createEaseInOut } from './createEases.js';

export { noopValue as easeLinear } from '../noop.js';

/**
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInQuad(progress: number) {
  return progress ** 2;
}

export const easeOutQuad = createEaseOut(easeInQuad);
export const easeInOutQuad = createEaseInOut(easeInQuad);

/**
 * Ease in cubic.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInCubic(progress: number) {
  return progress ** 3;
}

export const easeOutCubic = createEaseOut(easeInCubic);
export const easeInOutCubic = createEaseInOut(easeInCubic);

/**
 * Ease in quart.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInQuart(progress: number) {
  return progress ** 4;
}

export const easeOutQuart = createEaseOut(easeInQuart);
export const easeInOutQuart = createEaseInOut(easeInQuart);

/**
 * Ease in quint.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInQuint(progress: number) {
  return progress ** 5;
}

export const easeOutQuint = createEaseOut(easeInQuint);
export const easeInOutQuint = createEaseInOut(easeInQuint);

/**
 * Ease in sine.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInSine(progress: number) {
  return progress === 1 ? 1 : -Math.cos((progress * Math.PI) / 2) + 1;
}

export const easeOutSine = createEaseOut(easeInSine);
export const easeInOutSine = createEaseInOut(easeInSine);

/**
 * Ease in circ.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInCirc(progress: number) {
  return -(Math.sqrt(1 - progress * progress) - 1);
}

export const easeOutCirc = createEaseOut(easeInCirc);
export const easeInOutCirc = createEaseInOut(easeInCirc);

/**
 * Ease in exponential.
 *
 * @param  {number} progress Progress value betwen 0 and 1.
 * @returns {number}          Eased value between 0 and 1.
 */
export function easeInExpo(progress: number) {
  return progress === 0 ? 0 : 2 ** (10 * (progress - 1));
}

export const easeOutExpo = createEaseOut(easeInExpo);
export const easeInOutExpo = createEaseInOut(easeInExpo);
