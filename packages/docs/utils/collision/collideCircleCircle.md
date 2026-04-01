# collideCircleCircle

Test if two circles collide with one another.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4dfcdb565ba21d89329a6f23d80a1e4506c0c5bc52ae6335ee0aeb0b0df6e9bd","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvERFYdYAYXakRrGEpVrGI5apgBGRL2ZgMFabrUAmIyYzcjAIwiyYJgDph2AWywRSaNKy8uqWoZq4VFAQIgiIIAAq8IHs/MYWEUFy7LBwvADu7Gj4xpDFZAB0ngCSYHBYyjBQvI4YvPhoaFiIAPQ9+QMVAFYw/PykMBjFEL5wkhX+AOY9MtlwEmAAtLA0YhsrYZs6ERVY+FiU1MyLccjIIFjMpMzel8d6+rwaerz6IAC6FHuj2eryo72sXzCvCsAKBIAmaEEpDAlwAghNeOVeOtcrwIGlJDAMj80BBBCJ8OwwIssfhiRByqReAB+OH3DhgADWlw6XTgvR6QzgmzJsi5RQqcCRUAk3hgaGYFVgRB6gnErDgK2C7HWkm12UUYW+agqHW8rABgJA0qeDEQAE4qGoacUkPonVdSIsFXhViETeE9JdObhEAAGcH4J7MMRkJAOgC+FHQ2DDBGI8aoNHofsk0pJakMvGAnl45d4tCMYEE3kcZAA3GWKxhq7X66Qm1IK89ZYIBbwa3XG55E5dbQEkAB2ACszpgrvw0+zTx99pAEIMIepYasUZjcfIiAAbMnUzg8IQSORs3R14wsKQIDgAvZK23hzebYrJ4gAByei6ixuog+grt6vrxLQ25gGGADM+7PIeSBWGe1BppemZfjm96Ps+ZCYHwraDu2WbfnaCZ/vOi7uuBa54BgMFhgALIhsY0EeqEpuhF7xFeZE4UweEvoRvC9uw/Yfh244/va+jhlO1HAUuJ50ZBCLMH2CDOjuSBzhu0ZIRxKFoZgvEZtelyCfEMh1IEm42CWzbllWJGfl2Fa8MRQ4dh5PaaRJA4+SOYBjlQE5yVYgELspy5evRNlhLCOmwUgVEGQexknqZGF8VhVl3kJT4iW+rnBV+EXusxCEgEBIFgfF6nQSlYaepSmXxogXHnum/HYYV8QPsVBFvt5pEVbJ7ozjVdUqQ1P4JSAjEte6kYZUZnXdTxvX5beuaDcJI18OJkludJ4WTaBx4zTFIHHmp64ndptW6aBDXtRtnE5eZfUFftIAsBwXB8P6ORBmogbaGExZ2OYDm2KYDgtC4ageF4vj+PZOpGhEgaXNEsR4EkBapOkm5ZCEeSFMUpSMvSpBVGAtT1I0zStO0nTdH0Az5MMozjJM0yzPMSwGhwepbDsMB7Pqm5HGEpznFZ1y3MCMZghu0NQpkfyAmroJvEl2s/LCesIgqyKolQGLEtiuLwPihKwYWtvkpS1K0tidNkKy7IvdyvKcwKfTCqKKMSmgUoynKCpKiqaoalqoMS2LYOBoGZpoBaVoXRRoFTtFNGgZ6C3qaDON6HjK2gax63sZ14bfTtll7eutkFpuxalt2LlSSFnlje5zliQFp3lV2YXkb+HqF7FiCKY1bfQ0xVVschXWN9xZnNwJA0bvm9lJUY3eeWV41+eWg++cPT1952o4yXnVjhuls1xaXS8RMl/thvotcffXTiSZrQyFgHgHwfgAglgpmnY00JEwCCfN4XgAByAAAtKQQsoZixyFCKMUrAI4J3YJqFBXZPDt0PhET4ABeJy3ZXLMUjM2YiTCKDNlvrwNho5yGiAPi7KwvA6En3fL8cMzDuzEXkhI8snDjwSMTLw8u4MVFQ2oXDJK3AGy8D6FiUgghIggHlIqJAoA7wLglngYUIBEyJiAA==="}
import { collideCircleCircle } from '@studiometa/js-toolkit/utils';

const circle1 = {
  x: 40,
  y: 40,
  radius: 40,
};

const circle2 = {
  x: 100,
  y: 100,
  radius: 60,
};

collideCircleCircle(circle1, circle2); // true
```

### Parameters

- `circle1` (`{ x: number, y: number, radius: number }`): the first circle dimensions and position
- `circle2` (`{ x: number, y: number, radius: number }`): the second circle dimensions and position

### Return value

- `boolean`: whether the circles are colliding or not
