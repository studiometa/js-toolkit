# withVue2

Use this decorator to create a component which will mount on a given `ref` a [`Vue`](https://vuejs.org/v2/guide/) app and update this latter when the component's lifecycle hooks (`mounted`, `updated` and `destroyed`) are fired.

## Usage

```js
import { withVue2, Base } from '@studiometa/js-toolkit';
import Vue from 'vue';
import App from './App.vue';

export default class Component extends withVue2(Base, Vue) {
  static vueConfig = {
    render: (h) => h(App),
  };
}
```

### Parameters

- `BaseClass` (`Base`): The Base class to add Vue capabilities to
- `Vue` (`VueConstructor`): The Vue constructor to use

### Return value

- `Base`: A child class of the given class with management of a Vue application configured

## API

### Configuration

### `static vueConfig`

The configuration to use to instantiate the Vue application.

### Instance properties

#### `$vue`

The `$vue` instance property holds a `Vue` instance on which the vueConfig object is automatically given.

## Examples

### Simple usage

This decorator needs a `vueConfig` object and a `ref` in the component it is tied to.

:::tip
See the [`refs` API documentation part](/api/#config-refs) for explanations about how to use refs.
:::

```html
<div data-component="MyVueComponent">
  <div data-ref="vue"></div>
</div>
```

```js
import { Base } from '@studiometa/js-toolkit';
import Vue from 'vue';
import { withVue2 } from '@studiometa/js-toolkit/decorators';
import CustomComponent from './CustomComponent.vue';

export default class MyVueComponent extends withVue2(Base, Vue) {
  static vueConfig = {
    render: (h) => h(CustomComponent),
  };

  static config = {
    name: 'MyVueComponent',
  };
}
```
