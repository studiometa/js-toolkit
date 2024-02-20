# isEmpty

Test if a value is empty.

## Usage

```js
import { isEmpty } from '@studiometa/js-toolkit/utils';

isEmpty(); // true
isEmpty(null); // true
isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true

isEmpty(0); // false
isEmpty(1); // false
isEmpty([1, 2]); // false
isEmpty({ foo: 'foo' }); // false

class Foo {}
isEmpty(new Foo()); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is considered empty, `false` otherwise.
