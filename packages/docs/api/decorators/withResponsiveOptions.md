---
outline: deep
---

# withResponsiveOptions

Use this decorator to enable responsive options definition in your HTML.

:::warning

- Responsive options are readonly
- This decorator is not compatible with the [`withFreezedOptions` decorator](/api/decorators/withFreezedOptions.html)
- This decorator does not make options reactive (as in Vue.js or React), the different values are only resolved when the option is accessed
- Breakpoints' names are retrieved from the [`useResize` service](/api/services/useResize.html#breakpoint)

:::

## Usage

```js {1,3,7-10} twoslash
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';

export default class Component extends withResponsiveOptions(Base) {
  static config = {
    name: 'Component',
    options: {
      label: {
        type: String,
        responsive: true,
      },
    },
  };
}
```

```html {3-4}
<div
  data-component="Component"
  data-option-label:xxs="Small Mobile"
  data-option-label:xs:s="Large Mobile And Tablet"
  data-option-label="Other devices">
  ...
</div>
```

### Parameters

- `BaseClass` (`Base`): The class to add extra configuration to.

### Return value

- `Base`: A child class of the given class with the merge configuration

## API

### Configuration

#### `config.options.<name>.responsive`

This decorator adds support for a new boolean `responsive` property when declaring options in a class configuration. It **must** be set to `true` to enable the responsive evaluation of the option value.

### HTML

This decorator adds support for one or more suffix to define breakpoints in which the option should be read from when declaring options via `data-option-<name>` attributes. The format is:

```html
<div data-option-label[:<breakpoint>...]></div>
```

## Examples

### Define option only for a given breakpoint

Given three breakpoints `s`, `m` and `l`, the following component and its markup:

```js twoslash
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';

export default class Component extends withResponsiveOptions(Base) {
  static config = {
    name: 'Component',
    options: {
      label: {
        type: String,
        responsive: true,
      },
    },
  };

  resized(props) {
    console.log(props.breakpoint, this.$options.label);
  }
}
```

```html
<div
  data-component="Component"
  data-option-label:s="You are on a small screen"
  data-option-label="I am the default label">
  ...
</div>
```

Resizing the browser's window from the `l` to `m` then `s` breakpoint will log the following to the console:

```
'l', 'I am the default label'
'm', 'I am the default label'
's', 'You are on a small screen'
```

### Define different values for different breakpoints

With the same breakpoins and component as before, but with a different markup, we can define different values for each breakpoints:

```html
<div
  data-component="Component"
  data-option-label:s="You are on a small screen"
  data-option-label:m="You are on a medium screen"
  data-option-label:l="You are on a large screen">
  ...
</div>
```

With these attributes, the console will log:

```
'l', 'You are on a large screen'
'm', 'You are on a medium screen'
's', 'You are on a small screen'
```

### Define the same value for different breakpoints

Breakpoints can be combined to use the same value multiple times:

```html {3}
<div
  data-component="Component"
  data-option-label:s:m="You are on a small or medium screen"
  data-option-label:l="You are on a large screen">
  ...
</div>
```

The result in the console would be:

```
'l', 'You are on a large screen'
'm', 'You are on a small or medium screen'
's', 'You are on a small or medium screen'
```
