---
sidebar: auto
sidebarDepth: 5
prev: /components/Modal.md
next: false
---

# Tabs

## Examples

### Simple

<Preview>
  <div data-component="Tabs" data-options='{ "debug": true, "tabActiveStyle": { "borderBottomColor": "#fff" } }'>
    <div class="flex px-10">
      <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 bg-white border">
        Tab #1
      </button>
      <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 bg-white border">
        Tab #2
      </button>
      <button data-ref="Tabs.btn" class="-mb-px -ml-px p-4 bg-white border">
        Tab #3
      </button>
    </div>
    <div class="p-10 bg-white border">
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
</Preview>

<<< @/docs/components/Tabs.template.html

### Animated transition

You can add some transition to the content switch with the `contentActiveClass` and `contentInactiveClass` options.


<Preview>
  <div data-component="Tabs" data-options='{ "tabActiveClass": "bg-green-500 hover:bg-green-600", "tabInactiveClass": "bg-gray-800 hover:bg-gray-900", "contentInactiveClass": "opacity-0 scale-75 pointer-events-none", "contentInactiveStyle": {} }'>
    <div class="relative w-full h-32 mb-10">
      <div data-ref="Tabs.content" aria-hidden="false" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
        Content #1
      </div>
      <div data-ref="Tabs.content" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
        Content #2
      </div>
      <div data-ref="Tabs.content" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
        Content #3
      </div>
    </div>
    <div class="flex justify-center">
      <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
        Tab #1
      </button>
      <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
        Tab #2
      </button>
      <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
        Tab #3
      </button>
    </div>
  </div>
</Preview>


```html
<div data-component="Tabs" data-options='{
  "tabActiveClass": "bg-green-500 hover:bg-green-600",
  "tabInactiveClass": "bg-gray-800 hover:bg-gray-900",
  "contentInactiveClass": "opacity-0 scale-75 pointer-events-none",
  "contentInactiveStyle": {}
}'>
  <div class="relative w-full h-32 mb-10">
    <div data-ref="Tabs.content" aria-hidden="false" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
      Content #1
    </div>
    <div data-ref="Tabs.content" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
      Content #2
    </div>
    <div data-ref="Tabs.content" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded transform transition duration-500 ease-out-expo">
      Content #3
    </div>
  </div>
  <div class="flex justify-center">
    <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
      Tab #1
    </button>
    <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
      Tab #2
    </button>
    <button data-ref="Tabs.btn" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded transition duration-200 ">
      Tab #3
    </button>
  </div>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Tabs` class on an element:

```js
import { Tabs } from '@studiometa/js-toolkit';

new Tabs(document.querySelector('.my-custom-tabs-element'));
```

Or you can use the component as a child of another one:

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

### HTML

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

## API

### Refs

::: tip
The order of the refs element is important, as the component uses the index to match each button with its associated content.
:::

#### `Tabs.btn`

This ref will be used as a trigger to switch the content on click.

#### `Tabs.content`

This ref will be used to display the content associated with a tab element.

### Options

::: tip
Options can be defined per component via the `data-options` attribute or by extending the Tabs class.
:::

#### `tabActiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the tab element when it is active.

#### `tabActiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the tab element when it is active.

#### `tabInactiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the tab element when it is inactive.

#### `tabInactiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the tab element when it is inactive.

#### `contentActiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the content element when it is active.

#### `contentActiveStyle`

- Type: `CSSStyleDeclaration`
- Default: `{}`

Styles applied to the content element when it is active.

#### `contentInactiveClass`

- Type: `String`
- Default: `''`

A list of space separated classes applied to the content element when it is inactive.

#### `contentInactiveStyle`

- Type: `CSSStyleDeclaration`
- Default: ```{ display: 'none'}```

Styles applied to the content element when it is inactive.

### Events

#### `enable`

Emitted when a tab and its content are enabled.

**Params**
- `btn`: the button element
- `content`: the content element

#### `disable`

Emitted when a tab and its content are disabled.

**Params**
- `btn`: the button element
- `content`: the content element
