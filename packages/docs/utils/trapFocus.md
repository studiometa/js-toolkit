# trapFocus

Trap the tab navigation inside a given element.

::: tip
To understand the "tab trap" usage, read [Using JavaScript to trap focus in an element](https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element).
:::

## Usage

```js twoslash
import { trapFocus, untrapFocus } from '@studiometa/js-toolkit/utils';

// Limit the tab navigation to focusable children of the document's body
document.addEventListener('keyup', (event) => {
  trapFocus(document.body, event);
});

// Resume the trap and refocus the previously focused element
untrapFocus();
```

## Parameters

**trapFocus**

- `element` (`HTMLElement`): the element in which to trap the focus
- `event` (`KeyboardEvent`): the `keyup` event object

**untrapFocus**

The `untrapFocus` function does not need any argument.

## Return value

Both functions return nothing.
