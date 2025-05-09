# round

Round a number to the given decimals.

## Usage

```js twoslash
import { round } from '@studiometa/js-toolkit/utils';

round(10.5); // 10
round(10.546, 2); // 10.55
```

### Parameters

- `value` (`number`): The value to round.
- `decimals?` (`number`): The number of decimals to round to, defaults to `0`.

### Return value

- `number`: The rounded number.
