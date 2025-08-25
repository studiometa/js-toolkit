/**
 * Get the next spring value using velocity and spring physics.
 *
 * @param   {number} targetValue The final value.
 * @param   {number} currentValue The current value.
 * @param   {number} currentVelocity The current velocity.
 * @param   {number} [stiffness=0.1] The spring stiffness factor.
 * @param   {number} [damping=0.8] The damping factor to reduce oscillation.
 * @param   {number} [precision=0.01] The precision used to calculate the latest value.
 * @returns {[number, number]} The next value and velocity.
 */
export function spring(
  targetValue: number,
  currentValue: number,
  currentVelocity: number,
  stiffness = 0.1,
  damping = 0.8,
  precision = 0.01,
): [number, number] {
  const force = (targetValue - currentValue) * stiffness;
  const velocity = currentVelocity * damping + force;
  const value =
    Math.abs(targetValue - currentValue) < precision && Math.abs(velocity) < precision
      ? targetValue
      : currentValue + velocity;

  return [value, value === targetValue ? 0 : velocity];
}
