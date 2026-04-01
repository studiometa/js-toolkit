# createRange

Create an array of number between a given range and incremental step.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"dfdef795e62d11c51d03b3bd4c04f423e73029a698d0db25c6f7d258e1a7b5c5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAJWZgA5jEYBbdmES8wgjQCMyFXhua1d+oyd5waWKweOluTm6WQBdADph2GlgQpGjSsvIwSqq4VFAQIgiIIADC4TS8yhmkpMwYAqQQGhm8KuwkUjnRGWBQvADu7Gj4vE0wJWUwUtoyMBqdaGx2DgB0lNTMKonIyCAcYADWY/hoaFhwiAD0GwBWcAC0aBAQrPONw/aCUBJ9A8OwRBuC4qxwG+ZNGz0RUWrDyxqsEBeLxUezMEJIACcVFYnRUTSQAEZEVQBqQ1Awkl9FMo1GM5rhEAAGKgifDg5hiMhQgC+FHQ2EJBGI1NRdExIBYHC4fGxkVx6i0Oj0zls5ksIo8pnsMEckpcbnlZG8fgCQRCYTkOOiYziCTwqS1bUy4JyeX4BSKzHa5V4lTU1VqDSaLXwbVKtu6sj6YAGrCGstGqImUxmc0WVGWq3WW12ByOJzOFyuhRgt3uj2er3e+E+aX50T+aABQJBIDBEMQADYUbM4QjEMjg+i03g+T8YrNtISAEyk8k5KnkYk0ssiaBMtXBULATXfAW8Gn5Qq8ADkAAFk9c08wdvtDsdTmhM+wXquANx+PztgWMEm8RH3nvcc+8La8ZBP0wAFlMVdMAAcpiPl4Yw3MwSCgOynRwBIYB4LsIA0jSQA==="}
import { createRange } from '@studiometa/js-toolkit/utils';

createRange(0, 10, 2); // [0, 2, 4, 6, 8, 10]
```

### Parameters

- `min` (`number`): the minimum value for the range
- `max` (`number`): the maximum value for the rance
- `step` (`number`): the value to increment each number

### Return value

- `number[]`: an array of numbers
