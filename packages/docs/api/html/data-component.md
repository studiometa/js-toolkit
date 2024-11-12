# data-component

Use the `data-component` in HTML to bind a JavaScript class to an element.

:::tip READ MORE

- [Configuration: `config.components`](/api/configuration.html#config-components)
- [Guide: managing components](/guide/introduction/managing-components.html)

:::

## Simple usage

When using the `config.components` property, the framework will find components by using a selector combining the `data-component` attribute and the key declared in the configuration.

In the following example, both of the imported components will be mounted. One with the name `Component`, mounted on `[data-component="Component"]` elements found in the DOM. The other with the name `CustomName`, mounted on `[data-component="CustomName"]` elements.

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import Component from './Component.js';
import OtherComponent from './OtherComponent.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
      CustomName: OtherComponent,
    },
  };
}

export default createApp(App);
```

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component"></div>
    <div data-component="CustomName"></div>
  </body>
</html>
```

## Prefixed HTML elements

In addition to resolving components with the `data-component` attribute, the framework will look for prefixed HTML elements (the default is `tk-`).

The previous HTML example can be rewritten to:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component"></div> // [!code --]
    <div data-component="CustomName"></div> // [!code --]
    <tk-component></tk-component> // [!code ++]
    <tk-custom-name></tk-custom-name> // [!code ++]
  </body>
</html>
```

## Multiple components on a single HTML element

Mutliptle components can be declared on a single HTMLElement by declaring multiple names in the `data-component` attribute separated by a whitespace.

In the following example, both components from our previous app will be mounted on the same element.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component CustomName"></div>

    <!-- Or with a prefixed element -->
    <tk-component data-component="CustomName"></tk-component>
  </body>
</html>
```
