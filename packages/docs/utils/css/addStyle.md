# addStyle

This method will add styles to an HTML element.

## Usage

```js
import { addStyle } from '@studiometa/js-toolkit/utils';

addStyle(document.body, { display: 'block' });
addStyle([document.body, document.documentElement], { display: 'block' });
addStyle(document.querySelectorAll('div'), { display: 'block' });
```

### Parameters

- `element` (`HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>`): the target HTML element
- `styles` (`Partial<CSSStyleDeclaration>`): CSS styles to add

### Return value

This function does not return anything.
