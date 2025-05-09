# isFunction

Test if a value is a function.

## Usage

```js twoslash
import { isFunction } from '@studiometa/js-toolkit/utils';

isFunction(() => 'foo'); // true
isFunction('foo'); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is a function, `false` otherwise.
