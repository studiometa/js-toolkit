# createRange

Create an array of number between a given range and incremental step.

## Usage

```js
import { createRange } from '@studiometa/js-toolkit/utils';

createRange(0, 10, 2); // [0, 2, 4, 6, 8, 10]
```

### Parameters

- `min` (`number`): the minimum value for the range
- `max` (`number`): the maximum value for the rance
- `step` (`number`): the value to increment each number

### Return value

- `number[]`: an array of numbers
