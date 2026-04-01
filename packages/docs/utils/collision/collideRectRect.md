# collideRectRect

Test if a rectangle collides with another rectangle.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"04714dd5482fb9fcdb6bd719724d97f5d4b2825d35f948a791480238ba7237d4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvERFYdYAJRhilYxqWVoAjIl7MwGCrw1iATLv0ZuugEYRZMfQB0w7ALZYIpNNNnyYqmiBlCBQECIIiCAAKvA+7Px6xpr6AOasML5y7LBwvADu7Gj4epDFZMliaRkAdC4AkmBwWOwaULw2GLz4aGhYiAD0A/kjNQBWMPz8GhjFEB5wkjVeqQMy2XASYAC0sDRiWwMmaNvHNVj4WCFozKmRyMggWMykzG4hx1q8gdWZWiAAXQoj2er3eVGOpm+KTA6UypkBwJAGjQglIYBCAEENLxyrxNrleBBEpJMsdfriIIIRPh2LDcfhMhByqReAB+RGPDhgADWIR6fTggwGYzg2zQ9lYPKKNTgqKgEjcMBuNVgRAGgnErDgaz87E2kl12UUmkCNR6blYgKBIDlLwYiAAnFQMrDikgtABWKg3UipZV4db+QLBF103CIAAMVBpL2YYjISEdAF8KOhsBGCMREz66A6QDImj5PrpgC5eBXeLRdGBBG4bGQANzlysYGt1hukZtSSuFKDFdv1pstiuM9ipHqDzvd5MhO3eJAAdi0LpgbvwSG91Be/vznxC3Ijphj+DjCfIiAAbKn0zg8IQSORc/QmFhSBAcN4rFWpznbb6HQADgAZlXdcPR9HcAyiWgD3DJBQILU9XnPJBTBvagM3vbMn2oPNX3fT9MD4NteFrIdcPnB1HRXEBXVSd1EFo31dzwDA4LACMABYTzPGgL3QtNMLvKIHz/GgXyiRg3w/MhiIKHIBzIjs/yopNnTotcGI3RAtxY6CQD7d0w04zdeJQ/i0IwzARKzR9rnwqSZKI78xwnNBf0ogCPS0Y9NPAq9IL9Ay3J6DiI0vcz40sxBBNvTMxNwiT80LOVKjQcxeDLHsK2rZSKO7SteFI8jpxHBT+3wTzCsrUKPPysqwFnKg1KY4CeP87SzO3YK900BETIjDTYwsxMr2srDRJwhzJJAaTCLk788tK1TvKYrjIs6xjmKg/NYMGj1oyQvixri4SEum5983m2SvxIzy5zWr0Ovo7agtYqJ2IOpjaJG6LTom2zEpm67nMWvgjKqhrVvtD1Lz816dL03a8Eh8KPT8v7UNiwGLvsq6CNu+S6oelqnsXLdEaQTb9PzOr0baqLsbOmy8fExy5rYTgeCyYNTU0dRNB0UpDHSzLLGsDpJUcMAXHcTxvF5nIAn5sQQjCCI8FiNKEiSclYQyJXCUKYpSmZRlWX1uE6jARpmlaGB2k6bpen6IYRnycZJmmGBZkIBYlhWI0OANHY9k0Q5jlOTRzkua5bnuEE43BZEhehKoDb+TknmTj5+vTm5M94BEgUeFE0QxKhsUyPECXgIkSU49KKQlalaXpPFzYqDlS7ouk+SoAUsCFIZRXFSVpTQWV5UVZVmFVGB1U1dhtWD/VDiDZWQxji0rQBG1Wq0GiwK6pjkd6wM9RNFRNAZrRNqxmLI1x7D8bw2bUuLIXS3K5aVK7cqJV/41QrJDaq5USbQwAU1R6sNYqRkXCfRi58PqpzEP8b698mYxXvi/Kab9kqXyLGLH+OUfxQJAcVcBZCwEUIgTAcck46EwLJnA0wWgXpaWQe9AykI74P2Qv9ASwFkw2hkLAPA8svA+GAEbFWN8xC8GTAId8bheAAHIAACcpBAKnmHPEUYoJSyEnhqLUcB1HdhcJ/dKXwAC8WUWx5WjC2UiLiey0NMO40cDD3K6C8RQFwyYrGiEkGlSEvAHHZVyrobxVDeBxM8XEyBASgkhM3tfIIAtPhGEhNwRsvAhi4lIIIXAVAlQ3CQKAPMa5Q54FFCAZMyYgA="}
import { collideRectRect } from '@studiometa/js-toolkit/utils';

const rect1 = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

const rect2 = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

collideRectRect(rect1, rect2); // true
```

### Parameters

- `rect1` (`{ x: number, y: number, width: number, height: number }`): the first rectangle's dimensions and position
- `rect2` (`{ x: number, y: number, width: number, height: number }`): the second rectangle's dimensions and position

### Return value

- `boolean`: whether the rectangles are colliding or not
