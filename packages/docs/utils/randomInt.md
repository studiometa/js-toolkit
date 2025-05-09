# randomInt

Get a random integer between bounds.

## Usage

```js twoslash
import { randomInt } from '@studiometa/js-toolkit/utils';

randomInt(10); // an integer between 0 and 10
randomInt(20, 10); // an integer between 10 and 20
```

### Parameters

- `a` (`number`): lower bound
- `b` (`number`): upper bound (default: `0`)

### Return value

This function returns a random `number` between the `a` and `b` values.
