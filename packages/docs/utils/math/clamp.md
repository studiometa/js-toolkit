# clamp

Clamp a value in a given range.

## Usage

```js
import { clamp } from '@studiometa/js-toolkit/utils';

clamp(5, 0, 10); // 5
clamp(15, 0, 10); // 10
clamp(-5, 0, 10); // 0
```

### Parameters

- `value` (`number`): The value to clamp.
- `min` (`number`): The range minimum value.
- `max` (`number`): The rande maximum value.

### Return value

- `number`: The clamped value.
