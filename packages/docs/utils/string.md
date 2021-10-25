

# String utils

## Leading and trailing characters

The leading and trailing string utilities will ensure that characters from the start or end of a string are present by adding or removing them.

### `withLeadingCharacters`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the start of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withLeadingCharacters from '@studiometa/js-toolkit/utils/string/withLeadingCharacters.js';

withLeadingCharacters('string', '__');   // "__string"
withLeadingCharacters('__string', '__'); // "__string"
```

### `withTrailingCharacters`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the end of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withTrailingCharacters from '@studiometa/js-toolkit/utils/string/withTrailingCharacters.js';

withTrailingCharacters('string', '__');   // "string__"
withTrailingCharacters('string__', '__'); // "string__"
```

### `withoutLeadingCharacters`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to remove from the start of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutLeadingCharacters from '@studiometa/js-toolkit/utils/string/withoutLeadingCharacters.js';

withoutLeadingCharacters('__string', '__'); // "string"
withoutLeadingCharacters('string', '__');   // "string"
```

### `withoutLeadingCharactersRecursive`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to recursively remove from the start of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutLeadingCharactersRecursive from '@studiometa/js-toolkit/utils/string/withoutLeadingCharactersRecursive.js';

withoutLeadingCharactersRecursive('///string', '/');   // "string"
withoutLeadingCharactersRecursive('____string', '__'); // "string"
withoutLeadingCharactersRecursive('string', '__');     // "string"
```

### `withoutTrailingCharacters`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to remove from the end of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutTrailingCharacters from '@studiometa/js-toolkit/utils/string/withoutTrailingCharacters.js';

withoutTrailingCharacters('string__', '__'); // "string"
withoutTrailingCharacters('string', '__');   // "string"
```

### `withoutTrailingCharactersRecursive`

**Params**
- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to recursively remove from the end of the string.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutTrailingCharactersRecursive from '@studiometa/js-toolkit/utils/string/withoutTrailingCharactersRecursive.js';

withoutLeadingCharactersRecursive('string///', '/');    // "string"
withoutTrailingCharactersRecursive('string____', '__'); // "string"
withoutTrailingCharactersRecursive('string', '__');     // "string"
```

### `withLeadingSlash`

**Params**
- `string` (`string`): The string to modify.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withLeadingSlash from '@studiometa/js-toolkit/utils/string/withLeadingSlash.js';

withLeadingSlash('string');  // "/string"
withLeadingSlash('/string'); // "/string"
```

### `withTrailingSlash`

**Params**
- `string` (`string`): The string to modify.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withTrailingSlash from '@studiometa/js-toolkit/utils/string/withTrailingSlash.js';

withTrailingSlash('string');  // "string/"
withTrailingSlash('string/'); // "string/"
```

### `withoutLeadingSlash`

**Params**
- `string` (`string`): The string to modify.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutLeadingSlash from '@studiometa/js-toolkit/utils/string/withoutLeadingSlash.js';

withoutLeadingSlash('/string'); // "string"
withoutLeadingSlash('string');  // "string"
```

### `withoutTrailingSlash`

**Params**
- `string` (`string`): The string to modify.

**Returns**
- `string`: The modified string.

**Usage**
```js
import withoutTrailingSlash from '@studiometa/js-toolkit/utils/string/withoutTrailingSlash.js';

withoutTrailingSlash('string/'); // "string"
withoutTrailingSlash('string');  // "string"
```
