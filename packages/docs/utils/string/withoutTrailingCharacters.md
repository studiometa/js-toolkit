# withoutTrailingCharacters

## Usage

```js twoslash
import { withoutTrailingCharacters } from '@studiometa/js-toolkit/utils';

withoutTrailingCharacters('string__', '__'); // "string"
withoutTrailingCharacters('string', '__'); // "string"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to remove from the end of the string.

### Return value

- `string`: The modified string.
