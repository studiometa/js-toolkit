---
outline: deep
---

# withGroup

Use this decorator to group components together. It can become useful when a component needs to be aware of its siblings, for example to create a tabs system.

This decorator adds a `data-option-group="<GROUPNAME>"` option which can be used to group components together from the DOM. An instance of a component will be present in a group, exposed with the `$group` getter, only when it is mounted.

## Usage

```js {3,9,15} twoslash
import { Base, withGroup } from '@studiometa/js-toolkit';

class Foo extends withGroup(Base) {
  static config = {
    name: 'Foo',
  };
}

class Bar extends withGroup(Base) {
  static config = {
    name: 'Bar',
  };

  mounted() {
    console.log(this.$group); // Set [Foo, Bar]
  }
}
```

### Parameters

- `BaseClass` (`Base`): The class to add grouping capabilities to
- `namespace` (`string?`): An optional namespace to avoid conflicts between different group decorators, defaults to an empty string

### Return value

- `Base`: A child class of the given class with the `group` option

## Examples

### Keeping `<input>` in sync

The group decorator can be used to keep instances of a same component in sync by dispatching updates on all instances belonging to the same group.

In the following example, both `input[data-option-group="input"]` element seen in the `index.html` file will have their value kept in sync when it changes. The third input `input[data-option-group="other-group"]` will be left untouched.

::: code-group

```js {3,18-21} twoslash [Input.js]
import { Base, withGroup } from '@studiometa/js-toolkit';

export class SyncedInput extends withGroup(Base) {
  static config = {
    name: 'SyncedInput',
  };

  get value() {
    return this.$el.value;
  }

  set value(value) {
    this.$el.value = value;
  }

  onInput() {
    const { value, $group } = this;
    for (const instance of $group) {
      if (instance === this) continue; // Skip updating itself
      instance.value = value;
    }
  }
}
```

```js twoslash [app.js]
import { Base, createApp } from '@studiometa/js-toolkit';
import { SyncedInput } from './SyncedInput.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      SyncedInput,
    },
  };
}

export default createApp(App);
```

```html [index.html]
<input data-component="SyncedInput" data-option-group="input" type="text" />
<input data-component="SyncedInput" data-option-group="input" type="text" />

<input
  data-component="SyncedInput"
  data-option-group="other-group"
  type="text" />
```

:::

::: tip 💡 Two-way binding with [`DataModel`](https://ui.studiometa.dev/-/components/DataModel/)

You should use the [`DataModel` component](https://ui.studiometa.dev/-/components/DataModel/) from the [@studometa/ui package](https://ui.studiometa.dev) along its accompanying [`DataBind`](https://ui.studiometa.dev/-/components/DataBind/), [`DataComputed`](https://ui.studiometa.dev/-/components/DataComputed/) and [`DataEffect`](https://ui.studiometa.dev/-/components/DataEffect/) components if you need to add some reactivity to your existing DOM.

:::

### Using a namespace to avoid group collision

When using multiple groups in the same DOM tree, it can be useful to namespace them to avoid collisions.

In the following example, both `Tabs` and `Accordion` components use a group decorator, but they are namespaced to avoid interference if they share the same `data-option-group` attribute value.

::: code-group

```js {3,9,15-18} twoslash [Tabs.js]
import { Base, withGroup } from '@studiometa/js-toolkit';

export class Tabs extends withGroup(Base, 'tabs') {
  static config = {
    name: 'Tabs',
  };

  mounted() {
    console.log('Tabs group:', this.$group);
  }
}
```

```js {3,9,15-18} twoslash [Accordion.js]
import { Base, withGroup } from '@studiometa/js-toolkit';

export class Accordion extends withGroup(Base, 'accordion') {
  static config = {
    name: 'Accordion',
  };

  mounted() {
    console.log('Accordion group:', this.$group);
  }
}
```

```js twoslash [app.js]
import { registerComponent } from '@studiometa/js-toolkit';
import { Tabs } from './Tabs.js';
import { Accordion } from './Accordion.js';

registerComponent(Tabs);
registerComponent(Accordion);
```

:::
