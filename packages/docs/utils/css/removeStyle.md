# removeStyle

This method will remove styles from an HTML element.

## Usage

```js
import { removeStyle } from '@studiometa/js-toolkit/utils';

removeStyle(document.body, { display: 'block' });
```

### Parameters

- `element` (`HTMLElement`): the target HTML element
- `styles` (`Partial<CSSStyleDeclaration>`): CSS styles to remove

### Return value

This function does not return anything.
