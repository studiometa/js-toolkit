# collidePointRect

Test if a point collides with a rectangle.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"531b608f19b105bd70809b086cdc11a8af9e90af46705dc13fcb38538b958447","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvERFYdYABQjswaAEowxjLMtWJezMBgq9SmtPsMZu+gEYRZMQwB0w7ALY7SaabPkwlFXVzShAoCBEERBAAFXgfdn4DXh0g3zl2WDheAHd2NHxkszFDAHNWGAA6VwBJMDgsdjMoXlsMXnw0NCxEAHpenMHKgCsYfn4zDAKITzhJSohSUt6ZDLgJMABaWBoxDd7U1U3itEqsfCxQtGZSqORkECxmUmZ3UMOfQNUQAF0KB6eLzeVBOvA0JTA5VwfweZjQglIYFCNWyBRgKV0CXqmXRaNM5jKFQA5Nl7MIoNkAPy/f4gDhgADWoU63TgfV6wzgmzQDlYDPylTg8KgEncMGulVgRF6gnErDgKz87HWkkVGUUmPBp067lYvz+ICFzwYiAAnFQKpCCkgAIwANio1yW4rwq38X2CYlC9NwiAADFQRPhnswxGQkKaAL4UdDYX0EYjhx10E0gGT1HwffTAVy8PO8Wj6MCCdy2MgAblz+YwRZLZdIlbAkdCRu8SAA7AAmC0wK34JAAVkdz1KLuiH29Kl93bTwZeYfIiDt0djODwhBI5GT9CYWFIEBw3msBdrpaThqdJoAHAAWHt923D52p2iTsC+gDMgbnoZoi87K7UHG66Jlu1Apru+6HpgfA1rwxZnmBrYmqaM6WqU1qIDaT6jqmGBvr6d6ziGC5IABMZAWu0QbueNA7tE6ZCviYjZlWeaFvBdYVmxvBwQh9aNvmuSZAUp4CTx+AwOwpSdGJ3FNi2l62n6V73hh/aIERTq4XgJwER234kX+SDLhRmBUQmm5XBB0TaFBZAwSenGIYpxq2ja5p0r26mPtQI5jiAr4WlOSCqcR87GYg5GrvGNFgXRqZ2QeDnHnxXFIUpWGdu2amYdhfnPng+HBe+EaGRF4ZRYB5mxaB1n0SASXQceeRQKJzn1q5bZYR+Q5eQ+iB9dpAWtdaJW+jaAbhb+lXRZRtVWduiV7slR58JJ0myR157IbaN5hehmEOgVOnUVJMkMON7nlTN/7VcB1F1UtTBsJwPDpO6mrmNomKWEYJgnH91h2LyThgK4HheD4bo4h6WqhOEkR4HETGJMkHwfTi2R5AURQEpCFTVGAdQNE0MAtG0HRdD0/SDDkIxjBMMBTIQszzIsywwyqWw7OY+wfMc5hnBcVw3HcAIhsCjyYrwHo0hLQKhKCWqEtCtJwgiSJUCivB4hjKjrLAuuScx1wEzAJKtBA5JUvLdIqEyVAslgbL9Jy3K8vypxCoIIozOKzCSjA0qyuw8pqhw3MR7DX1iJUOp6j8Bq7VhdpEYdGn2jhAUwxqQTw1dWFEUGRmVX690WXF9Wpoxma/bwOZSPmHH8fJQlpYhjbNlQKc2le+UZ4O2ephOhc2sXP6kVh7YVwttE2WmkhMYDDc8S36WCdWckNjxo34Nvm95htF0H643cXm5WFXgd3mYVp/mpnpY8T6X/43pGBoyLAeCQ4sPjAJjPOqgtS8EjAIfc7heBEgAAI+z9mKa4HIuQ8lkF7GUco4BEkbK4WuGI0gAF5V5Nw4gGKscFSFNmwaIJePhQSEMbuxfQFC8zkIoFWPe+hOzMI6OdLaXC2GUNcDgpUQDPRoB+kEAG5huDll4P0XWpBBC4CoAg5gSBQApl7NzPAnIQCRkjEAA"}
import { collidePointRect } from '@studiometa/js-toolkit/utils';

const point = {
  x: 0,
  y: 0,
};

const rect = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

collidePointRect(point, rect); // true
```

### Parameters

- `point` (`{ x: number, y: number }`): the point's position
- `rect` (`{ x: number, y: number, width: number, height: number }`): the rectangle's dimensions and position

### Return value

- `boolean`: whether the point and rectangle are colliding or not
