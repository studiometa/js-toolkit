# random

Get a random number between bounds.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"dc75026fc0e4d26d9b1d39faa7d91e516b6feb9ebfba15ab215a128c8ad135d6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWxaJeYQQoBGZCrw0B+FWs1luh9VtIAdMOwVYIpNNNnyFlEPJEJEIAOIwnZmc5RVVzMl0AgHcYGCkAc3YSKQ0IYSg4ADp3NGZ472RkECxmGTcqIIAxdlI4J1T07IBdCiKSsvcNXgBlGBFJKF00uR1YfmZBVjQ4XjQIXgAGZtaQUgDBUjB3AEEw41JItBi43gADZlPeFzONU+WijjAAa3d8NDQsOEQAem+AKzgAFo5hBWE92GhMnVBFAJAoAsxMrAiN9BOJWHBvjIQgpMm8FKwQE0WiA6qUGIgAJxUVhxeJofBIABsVFypHiATw2Nc7keuEQCyoInwpWYYjISEpAF8KOhsPyCMQJay6BSQCwOFw+NzFMo9hYdPozPtTPqyNZbPZHMEeVRPN4/AErjbQkYLIdjgkkicGnIsjk8gU2qLyiAqjU6kNGkSVu1mKGur1+nIoyNeGMJlMZnNFvdVutNjszQctEdYlJzpdrqdbnnHi8qG8Pl9fgDgRBQeDIdDYYoEUiYCi0ewMViXIo8WgCUSSWTHEgAKwskC0sD0xmIZdsjlqnWhvlIABMQpFMnF5AFMrlODwhBI5BV9CYbE4PBdSmYxoNugMxdNbvNGw7AcJw93ce08H8QJ32LD1y14RJklTDJslZQMkEKYoQ3ccNanqYYoDzOMEx6PoBmQ0YYHGSZplmeYlhjIo1jQDYtioXYAJLaJ4MrK4UxrO5GJXdhnled5Ph+f4gRBMEIShFje3hXIByHdFMT3Sdp2JKg5wpSlqRXOkGWZND2U5HwwJpET+QAZhPUVzyQBYr2oeVbyVB9qFVZ9NTfPc9U4w1f04/9wisICrVA8dQwgnwoOdPdYNLT0EO9FICP9ND8gw4MOgqXhqjw5CiOwqhEzIlNfSgSjqKzOjcyE5jWKLTi4JOXjq1rIT6zE5tJLbGSu3kmE4X7ZFUTUsccU0wltNJNkKQARgAFmWmkjI3LdSh3Llot5aykDWkBhQcmgL2ckl+lgPBLRA3hgBgqUBFIUIAHIAAEe1G3IpPbTsIQmkc4FegBuaxrH8xbMgXbgQd4X5nVa5L4IWPjBihhcIeixhAQx2H4e+RGwraqRUeuXHoaxnFGAxnRD2h/GEaCJHuJODG0d4emF3cJTmCQUBVTiOAJC2HwARAKUpSAA==="}
import { random } from '@studiometa/js-toolkit/utils';

random(1.5); // a number between 0 and 1.5
random(-1.5); // a number between 0 and -1.5
random(1.5, 2.5); // a number between 1.5 and 2.5
```

### Parameters

- `a` (`number`): first bound
- `b` (`number`): second bound, defaults to `0`

### Return value

This function returns a random `number` between the `a` and `b` bounds.
