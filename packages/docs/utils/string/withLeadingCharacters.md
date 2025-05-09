# withLeadingCharacters

## Usage

```js twoslash
import { withLeadingCharacters } from '@studiometa/js-toolkit/utils';

withLeadingCharacters('string', '__'); // "__string"
withLeadingCharacters('__string', '__'); // "__string"
```

### Params

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the start of the string.

### Return value

- `string`: The modified string.
