# isNull

Test if a value is `null`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2b58bd1650d5c0743d02e15e33fab45e89b281b3bbedc1557b5698d129107faf","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OADkArq1aJejImykx5UsAGtIAdzB8AvAD5eS1irFxeYGawA6YdgFssEUqPHTZlEFAj8EiCAAKvDulmj4MLwA5uwkYCbKUeJWNgB03mjM0QHIyCAcmt74aGhYcIgA9JUAVnAAtGgQEKwa7GhpIlJQ7BCOMFlpsESVUmjsrHCV4tOS6SWOrCAAustUIsxuSACcVKwwYNERSABsVFmk0QN4HjbehbiIAAxU/PibzPw05IjbAL4UdDYR4EYhkTJ0BiBFgcLh8W6yRRJNSaHR6eSmcwpayyexOFxuCyeJZUXz+PAhEQWXgRKKxeKJMzJSw41gZc7ZXL5QoaYqlcpVWoNJotNodLo9PoDZhDGAjMYTKYzBFshZLVbrC5QgCsZwKByO+FOHMu10CKvu7DAjwATK93qRPt8kE8AUCcHhCCRyOdIUw2JweESbEimSitBBdNwMUlqay8c5XGFid4yQFgqFqbSYnEDoysSz0plOUg8gUrbyqCUyhVqnVGs1Wu1Omhur1+oNhqNxpNZrNiWk1Ss1iANltEAB2AAcewNx0QeouVyhIAteytjwAzPaPl9wc83dRgZ6wT7qH7oQG4cHEZjVLx1BGozGmXGbAmCcm7qS/OnKWEaUiHMGTvN9ZHZagSxQbkKz5GtBXrEUm3FVtJQ7GUuwVXtlTmcChw1UctR2CdZ0OedF02Zcblwkly2tJAABYd0dPcfldEdBFgG5E0JYAb1YXg/l4AAzUg+l4AByAABCV22lIUG1Fdpu0VCSAG57DxGjGFZbg1N4aoaVIFQtOJRg9IMyoRLYOAYFMkMJIkizDOEmzcCodCkFASEDjgXowDwOoQD+P4gA==="}
import { isNull } from '@studiometa/js-toolkit/utils';

isNull(null); // true
isNull(); // false
isNull(''); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is `null`, `false` otherwise.
