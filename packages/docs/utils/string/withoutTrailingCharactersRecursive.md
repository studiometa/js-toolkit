# withoutTrailingCharactersRecursive

## Usage

```js twoslash
import { withoutTrailingCharactersRecursive } from '@studiometa/js-toolkit/utils';

withoutLeadingCharactersRecursive('string///', '/'); // "string"
withoutTrailingCharactersRecursive('string____', '__'); // "string"
withoutTrailingCharactersRecursive('string', '__'); // "string"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to recursively remove from the end of the string.

### Return value

- `string`: The modified string.
