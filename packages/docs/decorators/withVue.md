---
sidebar: auto
sidebarDepth: 5
prev: /decorators/withMountWhenInView.html
next: /components/
---

# withVue

Use this decorator to create a component which will mount on a given `ref` a [`Vue`](https://vuejs.org/v2/guide/) app and update this latter when the component's lifecycle hooks (`mounted`, `updated` and `destroyed`) are fired.

## Examples

### Simple usage

This decorator needs a `vueConfig` object and a `ref` in the component it is tied to.

:::tip
See the [`refs` API documentation part](/api/#config-refs) for explanations about how to use refs.
:::

```html
<div data-component="MyVueComponent">
  <div data-ref="vue">
  </div>
</div>
```

```js
import Base from '@studiometa/js-toolkit';
import { withVue } from '@studiometa/js-toolkit/decorators';
import CustomComponent from './CustomComponent.vue';

export default class MyVueComponent extends withVue(Base) {
  static vueConfig = {
    components: {
      CustomComponent,
    },
    render: (h) => h(CustomComponent),
  };

  static config = {
    name: 'MyVueComponent',
    refs: ['vue'],
  };
}
```

## API

### Instance properties

#### `$vue`

The `$vue` instance property holds a `Vue` instance on which the vueConfig object is automatically given.