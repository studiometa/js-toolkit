# clamp01

Clamp a value in the 0–1 range.

## Usage

```js twoslash
import { clamp01 } from '@studiometa/js-toolkit/utils';

clamp01(0.5); // 0.5
clamp01(1.5); // 1
```

### Parameters

- `value` (`number`): The value to clamp between `0` and `1`.

### Return value

- `number`: The clamped between `0` and `1` value.
