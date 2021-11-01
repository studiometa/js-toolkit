# withoutLeadingCharactersRecursive

## Usage

```js
import { withoutLeadingCharactersRecursive } from '@studiometa/js-toolkit/utils';

withoutLeadingCharactersRecursive('///string', '/'); // "string"
withoutLeadingCharactersRecursive('____string', '__'); // "string"
withoutLeadingCharactersRecursive('string', '__'); // "string"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to recursively remove from the start of the string.

### Return value

- `string`: The modified string.
