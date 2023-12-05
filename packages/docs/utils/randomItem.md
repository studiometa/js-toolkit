# randomItem

Get a random item of an array or a random character of a string.

## Usage

```js
import { randomItem } from '@studiometa/js-toolkit/utils';

const items = ['a', 'b', 'c', 'd', 'e', 'f'];
randomItem(items); // one of the value in `items`

const string = 'abcdef';
randomItem(string); // one of the letter in `string`
```

### Parameters

- `items` (`array|string`): array or string

### Return value

This function returns a random item of an array, a random character of a string or `undefined` if the array or string is empty.
