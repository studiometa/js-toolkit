# withTrailingCharacters

## Usage

```js
import { withTrailingCharacters } from '@studiometa/js-toolkit/utils';

withTrailingCharacters('string', '__');   // "string__"
withTrailingCharacters('string__', '__'); // "string__"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the end of the string.

### Return value

- `string`: The modified string.

