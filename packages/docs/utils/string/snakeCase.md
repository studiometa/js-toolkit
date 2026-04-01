# snakeCase

Transform a string to `snake_case`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d94932cfb1a817c7718a251960501f8a1626ce65761b70e0bbf4dcd40832cea4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpecMMwDWMAMJcYiXowB0q5qQDmcRQFcwkyAHcwyALp8AvAD5eegxGMAdMOwC2WCKVHips+ZRAoCH4ERBAZIRIvXmYxNFJ2MA1eNAgxCWkAfX55ZQC0Zi0kZGQQDn0A/DQ0LG0AejqAKzgAWlSIVkl2NGURHSh2CFcYAuVYIjqdNHZWODqRBKT5jL84GGUq11YQU1MqEXUGRABOKlYYJLR8JFPqdQ0RvB9pOTWA8txEAAYqfnx1Zj8GjkE4AXwo6GwnwIxDI+ToRxALA4XD4z1WMBUak02ls+iMJnMunxDjAzjcHmi6NeuCoQRCeAiYCioliC0SyVS6V82Vy+UKoRKZUSkkq1VqiAazTaEA6XR6fQGQxGzDGMAmUxmc3ZS2puU2212+wKXiQAFZbudLtcTlQTQ9EXq3mdEp8AEy/f6kQHApBfUF7ECCWB4CmeUTAbkveS8UG8ABmpCGvAA5AABRWDYYFJqtdqdbqTaazFMAbmczidmJTAGVlbwa/EObwmTQwGgU9xS7wGmJlZkdRpskI2wwqNnmEhQAiLnBBmA8M0QKDQUA"}
import { snakeCase } from '@studiometa/js-toolkit/utils';

snakeCase('Some String Content'); // some_string_content
```

### Params

- `string` (`string`): The string to transform.

### Return value

- `string`: The transformed string.
