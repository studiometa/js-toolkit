---
sidebar: auto
sidebarDepth: 5
prev: /components/Modal.md
next: false
---

# Tabs

## Examples

### Simple

<ToolkitPreview>
  <div data-component="Tabs" data-option-styles='{ "btn": { "open": { "borderBottomColor": "#fff" } } }'>
    <div class="flex px-10">
      <button data-ref="btn[]" class="-mb-px -ml-px p-4 bg-white border">
        Tab #1
      </button>
      <button data-ref="btn[]" class="-mb-px -ml-px p-4 bg-white border">
        Tab #2
      </button>
      <button data-ref="btn[]" class="-mb-px -ml-px p-4 bg-white border">
        Tab #3
      </button>
    </div>
    <div class="p-10 bg-white border">
      <div data-ref="content[]" aria-hidden="false">
        Content #1
      </div>
      <div data-ref="content[]" aria-hidden="true">
        Content #2
      </div>
      <div data-ref="content[]" aria-hidden="true">
        Content #3
      </div>
    </div>
  </div>
</ToolkitPreview>

<<< @/components/Tabs.template.html

### Animated transition

You can add some transition to the content switch with the `contentActiveClass` and `contentInactiveClass` options.


<ToolkitPreview>
  <div
    data-component="Tabs"
    data-option-styles='{
      "btn": {
        "open": "bg-green-500 hover:bg-green-600",
        "active": "transition duration-500 ease-out-expo",
        "closed": "bg-gray-800 hover:bg-gray-900"
      },
      "content": {
        "active": "transition duration-500 ease-out-expo",
        "closed": "opacity-0 transform scale-50 pointer-events-none"
      }
    }'>
    <div class="relative w-full h-32 mb-10">
      <div data-ref="content[]" aria-hidden="false" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded">
        Content #1
      </div>
      <div data-ref="content[]" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded ">
        Content #2
      </div>
      <div data-ref="content[]" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded">
        Content #3
      </div>
    </div>
    <div class="flex justify-center">
      <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
        Tab #1
      </button>
      <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
        Tab #2
      </button>
      <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
        Tab #3
      </button>
    </div>
  </div>
</ToolkitPreview>


```html
<div
  data-component="Tabs"
  data-option-styles='{
    "btn": {
      "open": "bg-green-500 hover:bg-green-600",
      "active": "transition duration-1000 ease-out-expo",
      "closed": "bg-gray-800 hover:bg-gray-900"
    },
    "content": {
      "active": "transition duration-1000 ease-out-expo",
      "closed": "opacity-0 transform scale-50 pointer-events-none"
    }
  }'>
  <div class="relative w-full h-32 mb-10">
    <div data-ref="content[]" aria-hidden="false" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded">
      Content #1
    </div>
    <div data-ref="content[]" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded ">
      Content #2
    </div>
    <div data-ref="content[]" aria-hidden="true" class="absolute inset-0 flex items-center justify-center bg-white shadow-xl rounded">
      Content #3
    </div>
  </div>
  <div class="flex justify-center">
    <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
      Tab #1
    </button>
    <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
      Tab #2
    </button>
    <button data-ref="btn[]" class="mr-4 py-3 px-4 text-white bg-gray-800 hover:bg-gray-900 rounded">
      Tab #3
    </button>
  </div>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Tabs` class on an element:

```js
import Tabs from '@studiometa/js-toolkit/components/Tabs';

const tabs = new Tabs(document.querySelector('.my-custom-tabs-element'));
tabs.$mount();
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Tabs from '@studiometa/js-toolkit/components/Tabs';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Tabs,
    },
  }
}

const app = new App(document.documentElement);
app.$mount();
```

Or you can extend the component to apply a default configuration for your project:

```js
import TabsCore from '@studiometa/js-toolkit/components/Tabs';

export default class Tabs extends TabsCore {
  static config = {
    ...TabsCore.config,
    options: {
      styles: {
        type: Object,
        default: () => ({
          ...TabsCore.options.styles.default(),
          content: {
            closed: 'absolute opacity-0 pointer-events-none visibility-hidden',
          },
        }),
      },
    },
  };
}
```

### HTML

And setup the following markup in your HTML:

```html
<div data-component="Tabs">
  <button data-ref="btn[]">
    Tab #1
  </button>
  <button data-ref="btn[]">
    Tab #2
  </button>
  <button data-ref="btn[]">
    Tab #3
  </button>
  <div data-ref="content[]" aria-hidden="false">
    Content #1
  </div>
  <div data-ref="content[]" aria-hidden="true">
    Content #2
  </div>
  <div data-ref="content[]" aria-hidden="true">
    Content #3
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
Options can be defined per component via the `data-option-<option-name>` attributes or by extending the Tabs class.
:::

#### `styles`

- Type: `Object`
- Default:

```js
{
  content: {
    open: undefined, // Classes or styles for the `enabled` state
    active: undefined, // Used to add transition between the states
    closed: { // Default styles for the `disabled` state
      position: 'absolute',
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden'
    },
  },
  btn: undefined, // Classes or styles for the `btn` ref for each states
}
```

The `styles` options should be used to apply custom classes or styles to the `content` and `btn` refs for their `enabled` or `disabled` states.

### Events

#### `enable`

Emitted when a tab and its content are enabled.

**Params**
- `item`: a tab item object
  + `item.btn`: the button element
  + `item.content`: the content element
  + `item.isEnabled`: the state of the item

#### `disable`

Emitted when a tab and its content are disabled.

**Params**
- `item`: a tab item object
  + `item.btn`: the button element
  + `item.content`: the content element
  + `item.isEnabled`: the state of the item
