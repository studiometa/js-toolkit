# HTML API

For a practical introduction to using these attributes, see the [Components](/guide/introduction/managing-components.html), [Refs](/guide/introduction/managing-refs.html), and [Options](/guide/introduction/managing-options.html) guides.

The following attributes can be used:

- [data-component](./data-component.md)
- [data-ref](./data-ref.md)
- [data-option](./data-option.md)

## Customizing the attributes

These attributes can be configured with the [`defineFeatures` helper](/api/helpers/defineFeatures.html) or [`createApp`](/api/helpers/createApp.html):

```js
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({
  attributes: {
    component: 'tk-is',
    option: 'tk-opt',
    ref: 'tk-ref',
  },
});
```

You will then be able to update your HTML templates:

```diff
  <div
-   data-component="Component"
-   data-option-data="Hello world"
+   tk-is="Component"
+   tk-opt-data="Hello world">
    ...
-   <button data-ref="btn">
+   <button tk-ref="btn">
      Click me
    </button>
  </div>
```

## Using prefixed HTML element names

Components can also be defined by using a prefixed and dash-case formatted element name in HTML.

```diff
- <div data-component="Component">
+ <tk-component>
    ...
- </div>
+ </tk-component>
```

The attribute and element name API can be combined to attach multiple components to a single element:

```html
<tk-component data-component="Figure">...</tk-component>
```

The prefix is set to `tk` by default and can be configured with the [`defineFeatures` helper](/api/helpers/defineFeatures.html) or [`createApp`](/api/helpers/createApp.html):

```js
import { defineFeatures } from '@studiometa/js-toolkit';

defineFeatures({ prefix: 'w' });
```

```diff
- <tk-component>
+ <w-component>
    ...
- </tk-component>
+ </w-component>
```
