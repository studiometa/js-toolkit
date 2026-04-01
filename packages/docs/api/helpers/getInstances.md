# getInstances

Use the `getInstances` function to retrieve all mounted instances of every components. You can get instances for a specific component by providing its constructor as first parameter of the function.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f303ed5a448d93107e63dc0084907f2a58d66242507e69dce397d18f5669d078","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLzzaACSYD1veCMbiIXgAZVqki8xl4jAA1ABGXhXUisCDMKDccxWGx2L61P4A/jwJwuNx4ADitV4bFYvEsEFeNCgvHY/2CgJEtl4428EDA8GemksNK+7BIn341RsArAxSCoXCkWicSoCSScFSGWyuXyhWKpQqVRqdQaTRaKXwMFYOFIcBS30JHOJAQSllYHS6IB6fUQCIArEMRmMJn6AEwzXrfPCO9nMTnLNmrDYgLY7PbXP3+k5nHB4QgkcgzW4eHG2ewAYWl/JGDG6swYiAAbAAOIOjcYDSNzBYeKvWGtyxMCpAIzbbUi7fZIADsOeo53zKJu9DwUvZrLjnNBELQUIk+9Uhm0xmMTh9jYDgaiwc7h270dLW5dw9W01TE6nmab88weY8BbXMWq4eCwHBcHwsZEkCILgpC0KwoiyKFmiGJYhYA54lBzoklQZLuCAVL2LS9KMnKMAsmy0FcqQPJWsiAoiE8wqiiE4ojAI1ayvKkZhEgERRGyqoEIkyRpJkOR5AURQlOUlTVLUzD1DAjTNK0Vo2mQ9rYfGLr+G6HqdPWvSXk2M7tiGo4RtQUa9iAOkJkMSZTOO6bTn6La/ouAHLsBjYgGBDyQQSz7wJI8YYMYjB7LYoIRbBu7hWAkWIUiKKoZi2KYfYDkvnhrgEURNKsHSDJMhRm7UcitG8gxgrMdUrHsZKXG1oEvFKoJsTxKJmriTqUn6rJRoKaaKnmup1q2tpIXUfpaDup6xm+mG/rXsMHahgi1mzI+9mzThCBOSOiDmR+bmZmsXn/pchYrv5ZZ4v2Mq1ueDZIGGrYWXegw2T2/nPYOdZdasZ1ppOGYHAiADMRxelKsB4I99jAA4MAUPivyhSIRxCo1ADkAAChrySazDapJepFPjADcWW4pWrVynjIr4/4KSA9x/iZLT5jmGkvBFSRZXkZR2PIk8xV0lKA7cXA5jrqUlWHbwei5TBNO8ALiXQnzYAC0LJWkeVYtVRAku1QABpztaW5xsu1uY6twIwNtytwmva5CbtoGeVBk0goDyCMcAfHgmQgEcRxAA==="}
import { Base, getInstances } from '@studiometa/js-toolkit';
import Component from './Component.js';

// Get all mounted instances of all components
const instances = getInstances(); // Set<Base>

// Get all mounted instances of the `Component` component
getInstances(Component); // Set<Component>
```

**Parameters**

- `ctor` (`undefined | typeof Base`): the class from which the instances should be retrieved

**Return value**

- `Set<Base>`: all the instances created with the given class
