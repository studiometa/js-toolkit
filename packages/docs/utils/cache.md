# cache

Cache the result of a function with a list of keys.

## Usage

```js
import { cache } from '@studiometa/js-toolkit/utils';

const keys = [document.body, Symbol('key')];
const callback = () => performance.now();

console.log(cache(keys, callback)); // 100
console.log(cache(keys, callback) === cache(keys, callback)); // true

setTimeout(() => {
  console.log(cache(keys, callback)); // 100
}, 100);
```

### Parameters

- `keys` (`Array<any>`): a list of keys to be used to cache the result of the callback
- `callback` (`() => any`): the callback executed to retrieve the value to cache

### Return value

The value returned by the `callback` function given as parameter.
