---
sidebar: auto
sidebarDepth: 5
prev: /components/
next: /components/Cursor.md
---

# Accordion

An [accessible](http://web-accessibility.carnegiemuseums.org/code/accordions/), flexible and responsive accordion component, easy to use and easy to extend.

## Examples

### Simple

<ToolkitPreview>
  <div data-component="Accordion">
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html
<div data-component="Accordion">
  <div data-component="AccordionItem">
    <button data-ref="btn" class="font-bold">
      Title
    </button>
    <div data-ref="container" class="relative overflow-hidden">
      <div data-ref="content">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      </div>
    </div>
  </div>
  <div data-component="AccordionItem">
    <button data-ref="btn" class="font-bold">
      Title
    </button>
    <div data-ref="container" class="relative overflow-hidden">
      <div data-ref="content">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
      </div>
    </div>
  </div>
</div>
```

### With autoclose

By default, each `AccordionItem` will stay open when another one is opened. You can enable the `autoclose` behaviour by adding the `data-option-autoclose` attribute:

<ToolkitPreview>
  <div data-component="Accordion" data-option-autoclose>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html{1}
<div data-component="Accordion" data-option-autoclose>
  …
</div>
```

### Default state set to `open`

You can configure the `AccordionItem` components globally with the `item` options:

<ToolkitPreview>
  <div data-component="Accordion" data-option-item='{ "isOpen": true }'>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html{1}
<div data-component="Accordion" data-option-item='{ "isOpen": true }'>
  <div data-component="AccordionItem">
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

Or you can configure each `AccordionItem` component separately with their own `data-option-<option-name>` attribute:

<ToolkitPreview>
  <div data-component="Accordion">
    <div data-component="AccordionItem" data-option-is-open>
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html{2}
<div data-component="Accordion">
  <div data-component="AccordionItem" data-option-is-open>
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

### With transitions

You can add transitions to the opening and closing of the `AccordionItem` components with the `styles` option from the `AccordionItem` components.

<ToolkitPreview>
  <div data-component="Accordion" data-option-item='{ "styles": { "container": { "active": "transition-all duration-500 ease-out-expo" } } }'>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html{3-9}
<div
  data-component="Accordion"
  data-option-item='{
    "styles": {
      "container": {
        "active": "transition-all duration-500 ease-out-expo"
      }
    }
  }'>
  <div data-component="AccordionItem">
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

Transitions can be added to additional refs by adding a key matching their name in the `styles` option:

<ToolkitPreview>
  <div
    data-component="Accordion"
    data-option-item='{
      "styles": {
        "container": {
          "active": "transition-all duration-500 ease-out-expo"
        },
        "icon": {
          "open": "transform rotate-180",
          "active": "transition duration-500 ease-out-expo"
        }
      }
    }'>
    <div data-component="AccordionItem" data-option-is-open>
      <button data-ref="btn" class="font-bold">
        Title
        <span class="inline-block" data-ref="icon">▼</span>
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
        <span class="inline-block" data-ref="icon">▼</span>
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
    <div data-component="AccordionItem">
      <button data-ref="btn" class="font-bold">
        Title
        <span class="inline-block" data-ref="icon">▼</span>
      </button>
      <div data-ref="container" class="relative overflow-hidden">
        <div data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </div>
      </div>
    </div>
  </div>
</ToolkitPreview>

```html{8-11,17}
<div
  data-component="Accordion"
  data-option-item='{
    "styles": {
      "container": {
        "active": "transition-all duration-500 ease-out-expo"
      },
      "icon": {
        "open": "transform rotate-180",
        "active": "transition duration-500 ease-out-expo"
      }
    }
  }'>
  <div data-component="AccordionItem" data-option-is-open>
    <button data-ref="btn" class="font-bold">
      Title
      <span class="inline-block" data-ref="icon">▼</span>
    </button>
  </div>
  <div data-component="AccordionItem">
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Accordion` class on an element:

```js
import Accordion from '@studiometa/js-toolkit/components/Accordion';

const accordion = new Accordion(document.querySelector('.my-custom-accordion-element'));
accordion.$mount();
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Accordion from '@studiometa/js-toolkit/components/Accordion';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Accordion,
    },
  };
}

new App(document.documentElement).$mount();
```

### HTML

The following HTML is required for the `Accordion` component:

```html
<div data-component="Accordion">
  <div data-component="AccordionItem">
    <button data-ref="btn">Control</button>
    <div data-ref="container" style="position: relative; overflow: hidden;">
      <div data-ref="content">
        Content
      </div>
    </div>
  </div>
</div>
```

## API

### Refs

#### `AccordionItem.btn`

This ref will be the button used to toggle the content display.

#### `AccordionItem.container`

This ref is used to reveal the content based on its height.

#### `AccordionItem.content`

This ref is used to add the needed accessibility attributes and will hold your content.

### Options

::: tip
Options can be defined per component via the `data-option-<option-name>` attribute or by extending the `Accordion` class.
:::

#### `autoclose`

- Type: `Boolean`
- Default: `false`

A boolean to control if the opening of an `AccordionItem` will close all the others or not.

#### `item`

- Type: `Object`
- Default: `null`

This options can be used to configure all `AccordionItem` children in one place. This object will be merged with each `AccordionItem` instance `$options`.

#### `AccordionItem.isOpen`

- Type: `Boolean`
- Default: `false`

Used to set the initial state of an `AccordionItem`.

#### `AccordionItem.styles`

- Type: `Object`
- Default:

```js
{
  container: { // Name of the ref the styles should be applied to
    open: '', // Classes or styles for the `open` state
    active: '', // Classes or styles for the transition between states
    closed: '', // Classes or styles for the `closed` state
  }
}
```

This options can be used to apply custom styles or classes to all the component's refs for each state: opened, transitioning between states and closed.

### Events

#### `open`

Emitted when an `AccordionItem` opens.

**Parameters**
- `item`: the `AccordionItem` instance
- `index`: the index of the item

#### `close`

Emitted when an `AccordionItem` closes.

**Parameters**
- `item`: the `AccordionItem` instance
- `index`: the index of the item
