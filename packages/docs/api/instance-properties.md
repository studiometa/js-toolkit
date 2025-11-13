# Instance properties

## `$options`

An object containing the full options of the instance as defined in [the `config.options` property](/api/configuration.html#config-options). Additionnally to the options defined in the config, the following properties are also available:

- `$options.name` The name of the component
- `$options.log` Wether the `$log` method is silent or not
- `$options.debug` Wether the debug is active on this instance or not

The values for the `$options` object are read from and written to the `data-option-<option-name>` attribute of the root element.

:::tip
Boolean options with `true` as a default value can be negated with a `data-option-no-<option-name>` attribute.
:::

## `$refs`

An object containing references to all the component's refs, with each key being the name of the ref, and each value either the DOM element or a list of DOM elements.

```ts
interface RefsInterface {
  readonly [refName: string]: HTMLElement | Base | HTMLElement[] | Base[];
}
```

Refs are resolved with the selector `data-ref="<refName>"` within the component's scope. Refs of [children components](#components) are excluded, even if the child has not been registered via the [`config.components`](#components) object.

:::tip
You can force a ref to be an `Array` even when only one corresponding element exists in the DOM by appending `[]` to its name:

```html
<ul>
  <li data-ref="item[]"></li>
</ul>
```

:::

## `$children`

An object containing references to all the children component instances, with each key being the name of the child component, and each value a list of its corresponding instances.

```ts
interface ChildrenInterface {
  readonly [ComponentName: string]: Array<Base>;
}
```

**Example usage**

```js twoslash
import { Base } from '@studiometa/js-toolkit';
import { Figure, Slider } from '@studiometa/ui';

/**
 * @extends {Base<{ $children: { Figure: Figure[], Slider: Slider[] } }>}
 */
class App extends Base {
  static config = {
    name: 'App',
    components: {
      Figure,
      Slider,
    },
  };

  mounted() {
    for (const figure of this.$children.Figure) {
      console.log(figure.$id);
    }

    for (const slider of this.$children.Slider) {
      console.log(slider.$id);
    }
  }
}
```

## `$config`

The resolved configuration based on the current class [static `config` property](/api/configuration.html) merged with its ancestors properties.

## `$parent`

The parent instance when the current instance component is registered as another [component child](./configuration.md#config-components), defaults to `null` otherwise.

```ts twoslash {9}
import { Base } from '@studiometa/js-toolkit';

class Child extends Base {
  static config = {
    name: 'Child',
  };

  mounted() {
    console.log(this.$parent instanceof Parent); // true
  }
}

class Parent extends Base {
  static config = {
    name: 'Parent',
    components: {
      Child,
    },
  };
}
```

## `$root`

The root instance of the application when the current instance has been mounted as a [child component](#components). Defaults to a self reference if the component is stand-alone.

## `$services`

A [Service](https://github.com/studiometa/js-toolkit/blob/master/src/abstracts/Base/classes/Services.js) instance to manage the [`scrolled`](#scrolled-props), [`resized`](#resized-props), [`ticked`](#ticked-props), [`moved`](#moved-props), [`keyed`](#keyed-props) services hooks.

The following methods are available:

- `has(service: string): boolean`: test if the current component instance has the service method defined and if it is currently enabled
- `enable(service: string): () => void`: enable the given service if the current component instance has the service method defined, returns a function to disable the service
- `disable(service: string): void`: disable the given service
- `toggle(service: string, force?: boolean): void`: toggle the given service
- `get(service: string): any`: get the props of the given service
- `enableAll(): Array<() => void>`: enable all services which are defined
- `disableAll(): void`: disable all services

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn'],
  };

  onBtnClick() {
    if (!this.$services.has('ticked')) {
      this.$services.enable('ticked');
    } else {
      this.$services.disable('ticked');
    }
  }

  ticked() {
    // Do something on each frame...
  }
}
```
