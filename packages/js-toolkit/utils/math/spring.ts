/**
 * Get the next spring value using velocity and spring physics.
 * @param   {number} targetValue The final value.
 * @param   {number} currentValue The current value.
 * @param   {number} currentVelocity The current velocity.
 * @param   {number} [stiffness=0.1] The spring stiffness (or tension) factor, defaults to 0.1.
 * @param   {number} [damping=0.8] The damping factor (or friction) to reduce oscillation, defaults to 0.6.
 * @param   {number} [mass=1] The mass factor affecting acceleration, defaults to 1.
 * @param   {number} [precision=1/1e4] The precision used to calculate the latest value, defaults to 1/1e4.
 * @returns {[number, number]} The next value and velocity.
 * @link https://js-toolkit.studiometa.dev/utils/math/spring.html
 */
export function spring(
  targetValue: number,
  currentValue: number,
  currentVelocity: number,
  stiffness = 0.1,
  damping = 0.6,
  mass = 1,
  precision = 1 / 1e4,
): [number, number] {
  const force = (targetValue - currentValue) * stiffness;
  const acceleration = force / mass;
  const velocity = currentVelocity * damping + acceleration;
  const value =
    Math.abs(targetValue - currentValue) < precision && Math.abs(velocity) < precision
      ? targetValue
      : currentValue + velocity;

  return [value, value === targetValue ? 0 : velocity];
}
