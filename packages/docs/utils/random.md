# random

Get a random number between bounds.

## Usage

```js twoslash
import { random } from '@studiometa/js-toolkit/utils';

random(1.5); // a number between 0 and 1.5
random(-1.5); // a number between 0 and -1.5
random(1.5, 2.5); // a number between 1.5 and 2.5
```

### Parameters

- `a` (`number`): first bound
- `b` (`number`): second bound, defaults to `0`

### Return value

This function returns a random `number` between the `a` and `b` bounds.
