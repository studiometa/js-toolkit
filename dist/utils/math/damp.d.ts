/**
 * Get the next damped value for a given speed.
 *
 * @param  {Number} targetValue The final value.
 * @param  {Number} currentValue The current value.
 * @param  {Number=} [speed=0.5] The speed to reach the target value.
 * @return {Number} The next value.
 */
export default function damp(targetValue: number, currentValue: number, speed?: number | undefined): number;
