# smoothTo

Create a smoothing function to smooth transitions between values using damping or spring physics.

## Usage

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const x = smoothTo(0);
x.subscribe((value) => console.log(value));
x(100); // Smoothly transition from 0 to 100
```

### Parameters

- `start` (`number`): The initial value, defaults to `0`
- `options` (`SmoothToOptions`): Configuration options

### Options

- `damping` (`number`): Damping factor, the smaller the smoother, defaults to `0.6`
- `precision` (`number`): Precision used to decide when the smoothing should end, defaults to `1 / 1e8`
- `spring` (`boolean`): Enable spring physics, defaults to `true` if `stiffness` or `mass` is set, `false` otherwise
- `stiffness` (`number`): Stiffness factor for spring physics, the higher the stiffer, defaults to `0.1`
- `mass` (`number`): Mass factor when spring is enabled, the higher the heavier, defaults to `1`

### Return value

The `smoothTo` function returns a function with the following methods:

#### `smooth(newValue)`

Call the function with a new value to start transitioning to it, or without arguments to get the current smoothed value.

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const smooth = smoothTo(0);
smooth(100); // Start transition to 100
console.log(smooth()); // Get current smoothed value
```

### `add(value)`

Add the given value to the current raw value.

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const smooth = smoothTo(0);
smooth.add(10); // Add 10
console.log(smooth.raw()); // 10
smooth.add(-2); // Substract 2
console.log(smooth.raw()); // 8
```

#### `subscribe(callback)`

Subscribe a callback to value updates. Returns an unsubscribe function.

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const smooth = smoothTo(0);
const unsubscribe = smooth.subscribe((value) => {
  console.log('New value:', value);
});

// Later...
unsubscribe();
```

#### `unsubscribe(callback)`

Unsubscribe a specific callback from value updates.

#### `raw()`

Get the raw target value (not the smoothed value).

#### `damping(value?)`

Get or set the damping factor.

#### `precision(value?)`

Get or set the precision.

#### `stiffness(value?)`

Get or set the stiffness factor.

#### `spring(value?)`

Get or set the spring option.

### Types

```ts
type SmoothToOptions = Partial<{
  damping: number;
  precision: number;
  spring: boolean;
  stiffness: number;
  mass: number;
}>;

interface SmoothToFunction {
  (newValue?: number): number;
  subscribe: (fn: (value: number) => any) => () => boolean;
  unsubscribe: (fn: (value: number) => any) => boolean;
  raw: () => number;
  damping: (val?: number) => number;
  precision: (val?: number) => number;
  stiffness: (val?: number) => number;
  spring: (val?: boolean) => boolean;
}

function smoothTo(
  start?: number,
  options?: SmoothToOptions,
): SmoothToFunction;
```

## Examples

### Basic damping

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const position = smoothTo(0, { damping: 0.1 });

position.subscribe((value) => {
  // Called on each frame during the transition
  element.style.transform = `translateX(${value}px)`;
});

// Start transition to 300
position(300);
```

### Spring physics

```js twoslash
import { smoothTo } from '@studiometa/js-toolkit/utils';

const springValue = smoothTo(0, {
  spring: true,
  stiffness: 0.2,
  damping: 0.8,
  mass: 1.5,
});

springValue.subscribe((value) => {
  element.style.scale = value;
});

// Animate to 1 with spring physics
springValue(1);
```
