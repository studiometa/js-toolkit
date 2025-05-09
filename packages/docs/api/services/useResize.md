---
outline: deep
---

# Resize service

The resize service will help you manage your actions when the window is resized.

## Usage

```js twoslash
import { useResize } from '@studiometa/js-toolkit';

const { add, remove, props } = useResize();

add('custom-id', (props) => {
  console.log(props.width); // the viewport's width
  console.log(props.height); // the viewport's height
  console.log(props.ratio); // the width / height ratio
  console.log(props.orientation); // the orientation of the viewport
  console.log(props.breakpoint); // the current active breakpoint
  console.log(props.breakpoints); // all breakpoints' names
  console.log(props.activeBreakpoints); // a record of all breakpoints and their status as boolean
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

::: warning IMPORTANT
A debounce of 300ms is configured to limit the execution of each resize callback to only when the window stops being resized.
:::

### Define custom breakpoints

The `useResize()` service accepts an object defining breakpoints as parameter.

```js twoslash
import { useResize } from '@studiometa/js-toolkit';
// ---cut---
const { props } = useResize({
  s: '0px',
  m: '600px',
  l: '1200px',
});

console.log(window.innerWidth === 768); // true
console.log(props().breakpoint); // 'm'
console.log(props().breakpoints); // ['s', 'm', 'l']
console.log(props().activeBreakpoints); // { s: true, m: true, l: false }
```

Custom breakpoints values will be used to define `(min-width)` media queries to manage responsive features such as [responsive options](/api/decorators/withResponsiveOptions.html), breakpoint [manager](/api/decorators/withBreakpointManager.html) and [observer](/api/decorators/withBreakpointObserver.html) for components.

## Parameters

### `breakpoints`

- Type: `Record<string, string>`
- Required: `false`

Configure the breakpoints used for responsive features of this service. This parameter is optional, its default value is:

```js
{
  xxs: '0rem', // 0px
  xs: '30rem', // 480px
  s: '48rem', // 768px
  m: '64rem', // 1024px
  l: '80rem', // 1280px
  xl: '90rem', // 1440px
  xxl: '120rem', // 1920px
  xxxl: '160rem', // 2560px
}
```

::: tip 💡 Configuring breakpoints globally
At the application level, these breakpoints can be configure with the `options` parameter of [the `createApp` function](/api/helpers/createApp.html).
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

- Type: `string`
- Value: the name of the current active breakpoint

### `breakpoints`

- Type: `string[]`
- Value: the names of all defined breakpoints

### `activeBreakpoints`

- Type: `Record<string, boolean>`
- Value: an object with breakpoints as keys and their boolean state as values
