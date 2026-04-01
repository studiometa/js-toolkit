# isArray

Test if a value is an array.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"99326867253e044a2b00c505bd02d52c722f4f7ee1b0adc55da4928edbb2de75","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OAEFSpZhkS8WpAObzmYDHwC8APl7NlYuHvXIAugB0w7ALZYIpUeKkyMlEFAj8EiEABV4jgBmerxK7CRgvERsAK4whsZ60rIAdG5ozEreyMggHGAA1m74aGhYcIgA9JUAVnAAtGgQEKwF7GgpIjFQ7BDWMBkpsESVMWjsrHCV4tOSyRgpJdasIKamVCL6DIgAnFSsMGBKaPhIAOxUGcoDeE7zbvm4iAAMVPz4+sz8NOS7AL4UdDYJ4EYhkdJ0bYgFgcLh8O4uRQqYwaVQGcQosyWGx2ByGZyyNweLx4fwiMTBZihcKHKKxeIYtRJFxpS6ZbK5fJFKglMoVap1RrNVrtTpobq9fqDYajcaTWazAkLJYrNYbK7bACsFzyh2Op0QOquShuPgRhP27DATwATG8PjJvuCXgCgTg8IQSORLpCmGxODx8fMkap1Nw0UoEmoMFirLZ7I45i4iZ5vH4AhSQmEInTWHEo5F9Cz0uykDk8lbuQRSuUqrUGk0Wm0Ol0en0BswhjARmMJlMZublWhlqt1iBNg5zgAOfZ6k7nNnXKGDh5Wp4AZntnydv2efzHglgt3jeOAQZcvD+vECpD6vAA5AABVuSjv1oVN9qyvv3gDclmxJNZEYMxuF/Xhql4NBSDiQClUYABGMCIMqa82DgXAqClZgkFASFDjgXowDwOoQD+P4gA="}
import { isArray } from '@studiometa/js-toolkit/utils';

isArray([]); // true
isArray(1); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is an array, `false` otherwise.
