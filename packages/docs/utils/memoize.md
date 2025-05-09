# memoize

Memorize the output of a function in the memory cache.

## Usage

```js twoslash
import { memoize } from '@studiometa/js-toolkit/utils';

function heavyFunction(param) {
  return param ** param;
}

const memoizedHeavyFunction = memoize(heavyFunction);

memoizedHeavyFunction(2); // 4
```

### Parameters

- `fn` (`Function`): the function to memorize
- `options` (`{ maxAge?: number, cacheKey?: (...args:any) => string, cache?: Map }`): options on on how to memorize the output of the function

### Return value

This function returns a new function which will cache the first function results.
