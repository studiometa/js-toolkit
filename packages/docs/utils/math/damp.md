# damp

Get the next damped value for a given target and factor.

## Usage

```js
import { damp } from '@studiometa/js-toolkit/utils';

const targetValue = 10;
const factor = 0.5;
const precision = 0.1;
let currentValue = 5;

currentValue = damp(targetValue, currentValue, factor, precision); // 7.5
currentValue = damp(targetValue, currentValue, factor, precision); // 8.75
currentValue = damp(targetValue, currentValue, factor, precision); // 9.375
currentValue = damp(targetValue, currentValue, factor, precision); // 9.6875
currentValue = damp(targetValue, currentValue, factor, precision); // 9.84375
currentValue = damp(targetValue, currentValue, factor, precision); // 9.921875
currentValue = damp(targetValue, currentValue, factor, precision); // 10
```

### Parameters

- `targetValue` (`number`): The final value.
- `currentValue` (`number`): The current value.
- `factor` (`number`): The factor used to reach the target value, defaults to `0.5`.
- `precision` (`number`): The factor used to reach the target value, defaults to `0.01`.

### Return value

- `number`: The next damped value
