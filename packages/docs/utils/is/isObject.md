# isObject

Test if a value is an object.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8007eef3861e79a9784de2bf68fe4e12c9322da7da35648d39fcf43873e689df","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OAHkARgCsY/NIl6MibAK4wlasAGtIAdzB8AvAD5eUiBFYxmYADph2AWywRSo8dLkLKIKBD8CIggACrwngBmvGj4MLwA5uwkYLyqrBpicLx2vBCy8mgAdH5ozAnByMggHLp++GhoWHCIAPStMnAAtGhWrDrsxSJqUOwQzjBlRbBErWpo7KxwreIrkgUKRQ3OrCAAuntUIsweSACcVDZgCbFIABxUZaQJk3heGwyX7GC4iAAMVH4+BOzAUZHOAF8KOhsL8CMRwY86AwQiwOFw+O8fGgVOpNLxtHoIIZuEpLNZbA4nK53J51ti/AEgnhwiIxNFYvEkik0nisjlUvlsSVHuVKtVajp6o1mm0Ot1etYBkM0CMxhMpjM5gslms1t5Cls0Dt9ocQMdTogAKwPGowa63RC2p4vFEgLGFPy1X4AJkBwNIoJo5H+UJhODwhBI5CR9CYbE4PCyBoUuIy+MJBiMZL6lMcLjcHmTH0ZgWCYQi7JicUSyXtvPT/NyQsNpTFSCqNW+UqoDSaLXanR6fWVRWGo3Gk2Y0xgs3mi2Wqw9m22uwORyeKLuALtDvw91Fz1eIWXny7PyQAGZ/SCwSG/hCzYJYG8aUXgMXsbwIbxIqRxrwADkAAC47qlO8rDkqgzagugEANyOPm9KFIwwAQtw8G8O0MSkBoyEpjigGRFYgGYdhrS/mwcC4FQGrMEgoDIvacBjGAeCdCAEIQkAA==="}
import { isObject } from '@studiometa/js-toolkit/utils';

isObject({}); // true
isObject('foo'); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is an object, `false` otherwise.
