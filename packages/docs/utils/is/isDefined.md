# isDefined

Test if a value is defined.

## Usage

```js
import { isDefined } from '@studiometa/js-toolkit/utils';

isDefined('foo'); // true
isDefined(123); // true
isDefined(null); // true
isDefined(); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is not `undefined`, `false` otherwise.
