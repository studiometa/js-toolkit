# lerp

Interpolate a ratio between a given interval.

## Usage

```js twoslash
import { lerp } from '@studiometa/js-toolkit/utils';

lerp(0, 10, 0.5); // 5
```

### Parameters

- `min` (`number`): The interval minimum value.
- `max` (`number`): The interval maximum value.
- `ratio` (`number`): The ratio to get.

### Return value

- `number`: The lerped value
