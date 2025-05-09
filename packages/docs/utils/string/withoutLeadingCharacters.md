# withoutLeadingCharacters

## Usage

```js twoslash
import { withoutLeadingCharacters } from '@studiometa/js-toolkit/utils';

withoutLeadingCharacters('__string', '__'); // "string"
withoutLeadingCharacters('string', '__'); // "string"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to remove from the start of the string.

### Return value

- `string`: The modified string.
