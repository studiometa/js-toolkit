# removeStyle

This method will remove styles from an HTML element.

## Usage

```js twoslash
import { removeStyle } from '@studiometa/js-toolkit/utils';

removeStyle(document.body, { display: 'block' });
addStyle([document.body, document.documentElement], { display: 'block' });
addStyle(document.querySelectorAll('div'), { display: 'block' });
```

### Parameters

- `element` (`HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>`): the target HTML element
- `styles` (`Partial<CSSStyleDeclaration>`): CSS styles to remove

### Return value

This function does not return anything.
