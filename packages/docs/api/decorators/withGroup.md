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

<input data-component="SyncedInput" data-option-group="other-group" type="text" />
```

:::
