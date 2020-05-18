---
sidebar: auto
sidebarDepth: 5
prev: /services/raf.md
next: /services/scroll.md
---

# Resize service

The resize service will help you manage your actions when the window is resized.

## Usage

```js
import { useResize } from '@studiometa/js-toolkit';

const { add, remove, props } = useResize();

add('custom-id', (props) => {
  console.log(props.direction); // 'down' on keydown, 'up' on keyup
  console.log(props.triggered); // 1
  console.log(props.ENTER); // will be `true` when the pressed key is enter
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

::: warning IMPORTANT
A debounce of 300ms is configured to limit the execution of each resize callback to only when the window stops being resized.
:::

## Props

### `width`

- Type: `Number`

The width of the viewport.

### `height`

- Type: `Number`

The height of the viewport.

### `ratio`

- Type: `Number`

The `width / height` ratio of the viewport.

### `orientation`

- Type: `String`
- Values: `square`, `portrait` or `landscape`

### `breakpoint`

- Type: `String`
- Value: `[data-breakpoint]::before`

The current active breakpoint extracted from the `content` value of the `::before` pseudo-element on the first `[data-breakpoint]` element found in the DOM.

::: warning
This prop will not be available if no `[data-breakpoint]` element was found in the DOM.
:::

::: tip
This prop and the following one will work smoothly with the [breakpoint plugin](https://tailwind-config.meta.fr/plugins/breakpoint.html) of our [Tailwind configuration](https://tailwind-config.meta.fr/).
:::

### `breakpoints`

- Type: `Array`
- Value: `[data-breakpoint]::after`

::: warning
This prop will not be available if no `[data-breakpoint]` element was found in the DOM.
:::
