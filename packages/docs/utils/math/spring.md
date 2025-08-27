# spring

Get the next spring value using velocity and spring physics.

## Usage

```js twoslash
import { spring } from '@studiometa/js-toolkit/utils';

let currentValue = 0;
let currentVelocity = 0;
const targetValue = 100;

[currentValue, currentVelocity] = spring(
  targetValue,
  currentValue,
  currentVelocity,
  0.1, // stiffness
  0.6, // damping
  1, // mass
  0.01, // precision
);

console.log(currentValue, currentVelocity);
```

### Parameters

- `targetValue` (`number`): The final value
- `currentValue` (`number`): The current value
- `currentVelocity` (`number`): The current velocity
- `stiffness` (`number`): The spring stiffness (or tension) factor, defaults to `0.1`
- `damping` (`number`): The damping factor (or friction) to reduce oscillation, defaults to `0.6`
- `mass` (`number`): The mass factor affecting acceleration, defaults to `1`
- `precision` (`number`): The precision used to calculate the latest value, defaults to `1/1e4`

### Return value

- `[number, number]`: A tuple containing the next value and velocity

The function returns a tuple where:

- First element: The next position value
- Second element: The next velocity (set to `0` when the target is reached)

### Physics explanation

The spring function simulates a spring-damper system where:

- **Stiffness**: Controls how quickly the spring tries to reach the target (higher = faster, more rigid)
- **Damping**: Reduces oscillation and controls energy loss (higher = less bouncy)
- **Mass**: Affects how the object responds to forces (higher = slower acceleration, more inertia)
- **Precision**: Determines when the spring is considered "at rest"

### Types

```ts
function spring(
  targetValue: number,
  currentValue: number,
  currentVelocity: number,
  stiffness?: number,
  damping?: number,
  mass?: number,
  precision?: number,
): [number, number];
```

## Examples

### Animation loop

```js twoslash
import { spring } from '@studiometa/js-toolkit/utils';

let position = 0;
let velocity = 0;
const target = 300;

function animate() {
  [position, velocity] = spring(target, position, velocity);

  element.style.transform = `translateX(${position}px)`;

  // Continue animating if not at target
  if (position !== target) {
    requestAnimationFrame(animate);
  }
}

animate();
```
