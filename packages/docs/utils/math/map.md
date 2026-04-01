# map

Map a value from one interval to another.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4d3c315265458a8034f345a2e5b2e26328df60322bb2b8ce861819c98cf7e06e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALbMsjIm0ExEvMIOkAjMhV7swWQWgCy+1eq069Bo8ea1zG7aV0Qjhk2bVOrbtB7sHb0tSbkcQgB0wdmksCFI0GTlKECgIEQREEDssOF40fBheRVZlAVIIaV5JItJmMABzIoh+XmR9AP0AOi6O23sAXXyIXnqIArJeOsbm1uQ/TrAehf7aAa6UtGYGzORkECxmOukUkrKAFULipSK0EdksDYGKfcPjlL7PKUuiz4ByPLSfQxDTXUowJ4vA5HZgnKifQK8H7WDwApK0EFVM4QkDPV4wuEgFZfJFXYlooHRaSg7GQ/HvKjExHI8mA+yYsHKOkgUgwNCCUhgFLIz6cooPHBQYb5MnuIxTepNbkcMAAaxS+DQ/jgiAA9LqAFZwAC0dwgrFV7DQXTg/KgEmkfOYXVgRF1RnYrDgutkBR9ci6mukrFxzxAtqODEQAE4qKwYI0CkgAMxULakJpRkAPFIq3CIAAMVBE+BhYjISGjAF8KOhsPmCMQK2m6FmWBwuHwHgobuFnLoEV4LP2Uas+745V9xy5qpPAtOwsFnFEYnEEkksCk0hk8Dk8hMxeVKtUwLVFbM2oOlr0bCZBtKxhNSAqZtU5kzul0mYMNmntrt6VhU4blJIpsWlB5uTeID4VvUxviuf5AWBaksRuKCCQ+OD7FA0c0ApdlULFDCGSJOd9Fw1kZBQml0NxKFoMJb9aEoycCIxIjaXo/ZeX5QVhUQ29DwlGApTuGVmknF8lW4kAVXVKhNW1PVDRNM0LStG07QdJ0XRgN0PS9f0/UgoMQwGMMIwSJAAFZUzkhMGiTRB7PTTM8BzON9HzAAmYtSzqctyELKswxEaAG1XeJEmADdeCrI8qj+AABW1BHtSonVU00IHNS00HdcQvT+ABuKIom7GzdCLXgAEYapqnyC24EreH1OqCxSR0tiQUBWwTOAJCFLIjRAKsqyAA"}
import { map } from '@studiometa/js-toolkit/utils';

map(5, 0, 10, 0, 20); // 10
```

### Parameters

- `value` (`number`): The value to map.
- `inputMin` (`number`): The input's minimum value.
- `inputMax` (`number`): The input's maximum value.
- `outputMin` (`number`): The output's minimum value.
- `outputMax` (`number`): The output's maximum value.

### Return value

- `number`: The input value mapped to the output range.
