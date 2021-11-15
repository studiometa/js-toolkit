# Managing components

## What are components?

A component is simply a class extending the `Base` class. It must have a static `config` property containing the required `name` property.

## Defining components dependency

The [`components` property](/api/configuration.html#config-components) of the static `config` object can be used to define child components in a class.

```js {3,8-10,16-18,21-23,30-32}
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
      // <COMPONENT_KEY>: <COMPONENT_CLASS>
    },
  };

  mounted() {
    console.log('Parent mounted');
  }
}

const div = document.createElement('div');
div.innerHTML = '<div data-component="Child"></div>';

const parent = new Parent(div);
parent.$mount();
// Child mounted
// Parent mounted
```

The child components will be resolved with the following strategy:

- all elements matching the selector `[data-component="<COMPONENT_KEY>"]`
- all elements matching the selector `<COMPONENT_KEY>`

If no element is found, the child component will not be instanciated.

::: tip API Reference
Visit the API reference section for the [`config.components` property](/api/configuration.html#config-components) for more details.
:::

## Importing components lazily

Components can be imported lazily with asynchronous imports.

```js {6-8}
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      AsyncComponent: () => import('./components/AsyncComponent.js'),
    },
  };
}
```

When the parent class is mounted, the dynamic component will be imported if a matching element is found in the page. If not, the import will not be resolved, allowing you to split your app in multiple chunks easily.

:::tip Tip
Find more advanced lazy import strategies in the [Lazy imports](/guide/going-further/lazy-imports.html) section of the Getting further documentation.
:::

## Re-evaluating components

When updating HTML, use `this.$update()`
