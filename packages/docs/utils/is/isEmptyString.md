# isEmptyString

Test if a value is an empty string.

## Usage

```js twoslash
import { isEmptyString } from '@studiometa/js-toolkit/utils';

isEmptyString(''); // true
isEmptyString('foo'); // false
isEmptyString(); // false
isEmptyString([]); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is an empty string, `false` otherwise.
