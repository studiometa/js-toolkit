# wrap

Wrap a value within a specified range, creating a repeating cycle.

## Usage

```js twoslash
import { wrap } from '@studiometa/js-toolkit/utils';

wrap(5, 0, 3); // 2
wrap(-1, 0, 3); // 2
wrap(10, 0, 3); // 1
```

### Parameters

- `value` (`number`): The value to wrap
- `min` (`number`): The minimum value of the range
- `max` (`number`): The maximum value of the range

### Return value

- `number`: The wrapped value within the specified range

### Behavior

The `wrap` function ensures that:

- Values above `max` wrap around to the beginning of the range
- Values below `min` wrap around to the end of the range
- If `min` equals `max`, the function returns `min`
- The result is always within `[min, max)` (inclusive of min, exclusive of max)

### Types

```ts
function wrap(value: number, min: number, max: number): number;
```

## Examples

### Carousel/slider

```js twoslash
import { wrap } from '@studiometa/js-toolkit/utils';

let currentIndex = 0;
const totalSlides = 5;

// Navigate forward
currentIndex = wrap(currentIndex + 1, 0, totalSlides); // 1, 2, 3, 4, 0, 1...

// Navigate backward
currentIndex = wrap(currentIndex - 1, 0, totalSlides); // 4, 3, 2, 1, 0, 4...
```

### Angle wrapping

```js twoslash
import { wrap } from '@studiometa/js-toolkit/utils';

// Keep angles between 0 and 360 degrees
let angle = 450;
angle = wrap(angle, 0, 360); // 90

angle = -45;
angle = wrap(angle, 0, 360); // 315
```
