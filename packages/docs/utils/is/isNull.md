# isNull

Test if a value is `null`.

## Usage

```js twoslash
import { isNull } from '@studiometa/js-toolkit/utils';

isNull(null); // true
isNull(); // false
isNull(''); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is `null`, `false` otherwise.
