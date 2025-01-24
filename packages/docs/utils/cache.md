# cache

Cache the result of a function with a single key or a list of keys.

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

console.log(cache('key', callback)); // 200
console.log(cache('key', callback) === cache('key', callback)); // true

setTimeout(() => {
  console.log(cache('key', callback)); // 200
}, 100);
```

### Parameters

- `keys` (`any | Array<any>`): a list of keys to be used to cache the result of the callback
- `callback` (`() => any`): the callback executed to retrieve the value to cache

### Return value

The value returned by the `callback` function given as parameter.
