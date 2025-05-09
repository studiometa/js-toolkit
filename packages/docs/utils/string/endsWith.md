# endsWith

A [more performant](https://jsbench.me/1hlkqqd0ff/1) way than `String.prototype.endsWith` to test if a string ends with another string.

## Usage

```js twoslash
import { endsWith } from '@studiometa/js-toolkit/utils';

endsWith('string', 'ing'); // true
endsWith('string', 'no'); // false
```

### Params

- `string` (`string`): The string to test.
- `search` (`string`): The string to search for at the end.

### Return value

- `boolean`: Wether the string ends with search or not.
