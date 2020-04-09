---
sidebar: auto
---

# Tabs

## Options

Option can be defined per component via the `data-options` attribute or by extending the Tabs class.

### `tabActiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the tab element when it is active.

### `tabActiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the tab element when it is active.

### `tabInactiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the tab element when it is inactive.

### `tabInactiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the tab element when it is inactive.

### `contentActiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the content element when it is active.

### `contentActiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the content element when it is active.

### `contentInactiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the content element when it is inactive.

### `contentInactiveStyle`

- Type: `CSSStyleDeclaration`
- Default: ```{ display: 'none'}```

Styles applied to the content element when it is inactive.

## Usage

Import the component in your application in Javascript:

```js
import { Base, Tabs } from '@studiometa/js-toolkit';

class App extends Base {
  get config() {
    return {
      components: {
        Tabs,
      },
    };
  }
}

new App(document.documentElement);
```

And setup the following markup in your HTML:

```html
<div data-component="Tabs" data-options='{ "tabActiveStyle": { "borderBottomColor": "#fff" } }'>
  <div class="flex px-4 border-b">
    <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 border">
      Tab #1
    </button>
    <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 border">
      Tab #2
    </button>
    <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 border">
      Tab #3
    </button>
  </div>
  <div class="p-4">
    <div data-ref="Tabs.content" aria-hidden="false">
      Content #1
    </div>
    <div data-ref="Tabs.content" aria-hidden="true">
      Content #2
    </div>
    <div data-ref="Tabs.content" aria-hidden="true">
      Content #3
    </div>
  </div>
</div>
```
