---
outline: deep
---

# defineFeatures

Use the `defineFeatures` function to configure global features (breakpoints, attributes, etc.) without using `createApp`. This is useful when using `registerComponent` to mount components independently.

## Usage

```js twoslash
import { defineFeatures, registerComponent } from '@studiometa/js-toolkit';
import MyComponent from './MyComponent.js';

defineFeatures({
  breakpoints: {
    s: '40rem',
    m: '80rem',
    l: '100rem',
  },
});

registerComponent(MyComponent);
```

### Available options

All options are optional. Only the provided options will be updated.

#### `breakpoints`

An object mapping breakpoint names to CSS values.

```js twoslash
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({
  breakpoints: {
    s: '40rem',
    m: '80rem',
    l: '100rem',
  },
});
```

#### `blocking`

Whether the app should mount immediately (`true`) or wait for `document.readyState === 'complete'` (`false`, default).

```js twoslash
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({ blocking: true });
```

#### `prefix`

The prefix used for component selectors (default: `'tk'`).

```js twoslash
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({ prefix: 'app' });
```

#### `attributes`

Custom attribute names for components, options, and refs.

```js twoslash
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({
  attributes: {
    component: 'data-component',
    option: 'data-option',
    ref: 'data-ref',
  },
});
```

## Parameters

- `options` (`Partial<Features>`): an object with any combination of `breakpoints`, `blocking`, `prefix`, and `attributes`
