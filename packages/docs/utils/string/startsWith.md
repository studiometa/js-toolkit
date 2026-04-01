# startsWith

A [more performant](https://jsbench.me/1hlkqqd0ff/1) way than `String.prototype.startsWith` to test if a string starts with another string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d7199a1fa8b7ee6efa90255c79c9056fc03a13a4ec8703a203697b4940a2adce","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvOGmak0cAOrs0+RjNLswAc0TS0mnRWkw5I/Ho1bt3PQCMIEVqbAAdMOwC2WCPP1yFZVVKECgIEQREEAAVeDRedn5eZn1DbX95OF4AdxV8ZMhVMlTrADp3d2j8diya5N5PXxheHFJ+X09mMHiSUjgJKQgkot4AAwBlAzKsUgg0OewYUpkApTzRhphVaFKQ2W1I5GQQDjAAaxD8NDQsOEQAenuAKzg7GFF8Us8Ye4BGfFYZwAjkCoAAGfj8P4gAC6FGOpwuVCuNzujxeAFp5k4ziplmhBFAJN9ZKVYER7oJxKw4PcrDo6bJMkFPldPKxYXCQCt5EgAJxUZw6YKIX5gqhM7RbPA8wJ5EKnXCIcUgcxyZhiMj8gC+FHQizwhF6ezoDCiLA4XD4srWqnUUx0lgd2mMcFMpHMTrStl4DicLncXh8fhtLJCYQieFiMgSSRS9PSNpyeQKc3wxQT5TcYCqdTqKUapGarXapE63V4vX6kl4Q14IwmztKMzmCxw+NWLI2JMIUF2EuYByQRxOWiRBGutwez1e73MXx+/0BIPBkOhcIRY8uk7RM6xjkBeJkhOJW2YZJgFKp7BpjLSjM7eVKbI5MK5sqQADYVULtCKxQOpBSma3JMnKwSCloSoAExUGqpAajQ5DKrq+o4IaxBahKppMGwnA8Bk4FqAmXrWK67qeiUOg+n6zhdIG3i+PEobylQEaRDEcSxvUCaEVkuSqKmRSkFR2hZpU1S1FkBZNC0ZCluWPRkNWgzDOmYyTGkzazPMmDtixqjdlsvb9tQg6HJu5zbqi04vG8HwLn8ALAqCEJQr8sLwqOVnIjutlwPuOJHgSRIQCS57kpS1K0gmD7Mk+L6clQH6IHyADsgrvH++BIABZlAdKUQGTlkFgEqADMcH4OqmrIWC2pciI0BKiAQZMbwwB8SyvDagIsyeLwADkAACx6heFe7YoeaBRTecCDQA3BUYDFYwg0JoNxjrQYg3cAtvCPPWpCCDA7irdtaSbUNkC7fth38GwbohOFSCgKa7wqXgLwgNq2pAA=="}
import { startsWith } from '@studiometa/js-toolkit/utils';

startsWith('string', 'str'); // true
startsWith('string', 'no'); // false
```

### Params

- `string` (`string`): The string to test.
- `search` (`string`): The string to search for at the begining.

### Return value

- `boolean`: whether the string starts with search or not.
