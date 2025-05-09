# startsWith

A [more performant](https://jsbench.me/1hlkqqd0ff/1) way than `String.prototype.startsWith` to test if a string starts with another string.

## Usage

```js twoslash
import { startsWith } from '@studiometa/js-toolkit/utils';

startsWith('string', 'str'); // true
startsWith('string', 'no'); // false
```

### Params

- `string` (`string`): The string to test.
- `search` (`string`): The string to search for at the begining.

### Return value

- `boolean`: Wether the string starts with search or not.
