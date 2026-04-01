# isBoolean

Test if a value is a boolean.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"07a03adb67a48991513b57d75ac86d7a4e384f7b6a261e04fc9de5c7ee296c55","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OACEIEVjGZhEvRkTYBXGItVgA1pADuYPgF4AfLxWt1YuLwBG02fIA6YdgFssEUqPFSZcsEoQKAh+BEQQABV4HwAzXmZeAHN2EjBzNRhrBLsHAIA6ILRmJPDkZBAOHSD8NDQsOEQAeiaAKzgAWjQHbXY0fJFVKHYINxhi/NgiJtU0dlY4JvElyTz5fNq3VhAAXR2qEWZvJABOKlkwJLR8U6pi0iTxvF81wPP2MFxEAAYqfnwjsx+DRyIgTgBfCjobBfAjEMhFOgMCIsDhcPgvfzyZSZTQ6fSGRQWKziXJYsAudyebzWPyON7BULhKIxMTxRIpNIZSxZUmJezkwp3EplCpVbQ1OoNZptTrdGS9fqDYajcbMSYwaazeaLZaY+kbNBbXb7ECHY6IACsZ0qMEu11u1COj2RIH1ASCVS+ACY/gDSECQUhvpDoTg8IQSOQ7kimGxODxaa8cTy8boIAZuETMtkBfTKR4vD5VuSgiEwnhoiI2TlOXbuSSbPzXkKnaUkOVKh8JVRavVGi12l0en0BmghiMxhMpjM5gsVis6QVNts9gd7siABwAFnOdquNzBwoeTwi7vkno+XwAzH7AcCET9wabBLBnoWacAk+TeODeLFSFGXgAHIAAFlUnNVZWHBU+lnHVgIAbhcSkS3pRg0FIdRuEQ3gWl4TD1FQpdsWA2JpGAnC8Kaf82DgXAqCnZgkFAJE7TgEZAgidoQHBcEgA==="}
import { isBoolean } from '@studiometa/js-toolkit/utils';

isBoolean(true); // true
isBoolean('foo'); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is a boolean, `false` otherwise.
