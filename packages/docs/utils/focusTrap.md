# focusTrap

Trap the tab navigation inside a given element.

::: tip
To understand the "tab trap" usage, read [Using JavaScript to trap focus in an element](https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element).
:::

## Usage

```js
import { focusTrap } from '@studiometa/js-toolkit/utils';

const { trap, untrap } = focusTrap();

// Limit the tab navigation to focusable children of the document's body
document.addEventListener('keyup', (event) => {
  trap(document.body, event);
});

// Resume the trap and refocus the previously focused element
untrap();
```
