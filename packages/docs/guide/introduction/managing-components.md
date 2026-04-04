# Components

A component is a class extending the [`Base`](/api/) class. Every component must have a static `config` property with at least a `name`.

## Defining a component

```js
import { Base } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = {
    name: 'Counter',
  };

  count = 0;

  mounted() {
    this.$el.textContent = `Count: ${this.count}`;
  }
}
```

To connect a component to the DOM, add a matching `data-component` attribute:

```html
<div data-component="Counter"></div>
```

## Registering components

Use [`registerComponent`](/api/helpers/registerComponent.html) to automatically find and mount all matching elements:

```js
import { registerComponent } from '@studiometa/js-toolkit';

registerComponent(Counter);
```

This scans the DOM for `[data-component="Counter"]` elements and mounts an instance on each one. It also watches for newly added elements using a `MutationObserver`.

## Parent–child components

Components can declare child components via the [`components` config](/api/configuration.html#config-components). The parent will automatically discover and mount children found inside its root element.

```js {3,8-10,16-18}
import { Base } from '@studiometa/js-toolkit';

class Child extends Base {
  static config = {
    name: 'Child',
  };

  mounted() {
    console.log('Child mounted');
  }
}

class Parent extends Base {
  static config = {
    name: 'Parent',
    components: {
      Child,
    },
  };

  mounted() {
    console.log('Parent mounted');
  }
}
```

```html
<div data-component="Parent">
  <div data-component="Child"></div>
</div>
```

Children are resolved by matching `[data-component="<KEY>"]` elements inside the parent's root element. Children mount before the parent — so `"Child mounted"` logs before `"Parent mounted"`.

## Lazy imports

Components can be imported lazily with dynamic imports to split your bundle:

```js {6-8}
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      HeavyWidget: () => import('./components/HeavyWidget.js'),
    },
  };
}
```

The import is only triggered if a matching element exists in the DOM. If no `[data-component="HeavyWidget"]` is found, the chunk is never fetched.

::: tip Going further
See [Child Components](/guide/going-further/lazy-imports.html) for advanced lazy import strategies like `importWhenVisible`, `importOnInteraction`, and more.
:::

## Updating the DOM

When you dynamically add or remove HTML, call `this.$update()` so the component re-evaluates its children and refs:

```js
class List extends Base {
  static config = {
    name: 'List',
    refs: ['items[]'],
  };

  addItem() {
    this.$el.insertAdjacentHTML(
      'beforeend',
      '<div data-ref="items[]">New</div>',
    );
    this.$update();
  }
}
```

See also: [Configuration](/api/configuration.html), [`data-component`](/api/html/data-component.html), [Instance methods](/api/instance-methods.html), and [Instantiation](/api/instantiation.html).
