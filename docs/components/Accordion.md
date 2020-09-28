---
sidebar: auto
sidebarDepth: 5
prev: /components/
next: /components/Modal.md
---

# Accordion

An [accessible](http://web-accessibility.carnegiemuseums.org/code/accordions/), flexible and responsive accordion component, easy to use and easy to extend.

## Examples

### Simple

<Preview>
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
</Preview>

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

### Without autoclose

By default, each `AccordionItem` will close itself when another one is opened. You can disable this behaviour by setting the `autoclose` option to `false`:

<Preview>
  <div data-component="Accordion" data-options='{ "autoclose": false }'>
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
</Preview>

```html{1}
<div data-component="Accordion" data-options='{ "autoclose": false }'>
  …
</div>
```

### Default state set to `open`

You can configure the `AccordionItem` components globally with the `item` options:

<Preview>
  <div data-component="Accordion" data-options='{ "item": { "isOpen": true } }'>
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
</Preview>

```html{1}
<div data-component="Accordion" data-options='{ "item": { "isOpen": true } }'>
  <div data-component="AccordionItem">
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

Or you can configure each `AccordionItem` component separately with their own `data-options` attribute:

<Preview>
  <div data-component="Accordion">
    <div data-component="AccordionItem" data-options='{ "isOpen": true }'>
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
</Preview>

```html{2}
<div data-component="Accordion">
  <div data-component="AccordionItem" data-options='{ "isOpen": true }'>
    …
  </div>
  <div data-component="AccordionItem">
    …
  </div>
</div>
```

### With transitions

You can add transitions to the opening and closing of the `AccordionItem` components with the `styles` option from the `AccordionItem` components.

<Preview>
  <div data-component="Accordion" data-options='{ "item": { "styles": { "container": { "active": "transition-all duration-500 ease-out-expo" } } } }'>
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
</Preview>

```html{3-11}
<div
  data-component="Accordion"
  data-options='{
    "item": {
      "styles": {
        "container": {
          "active": "transition-all duration-500 ease-out-expo"
        }
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

<Preview>
  <div
    data-component="Accordion"
    data-options='{
      "autoclose": false,
      "item": {
        "styles": {
          "container": {
            "active": "transition-all duration-500 ease-out-expo"
          },
          "icon": {
            "open": "transform rotate-180",
            "active": "transition duration-500 ease-out-expo"
          }
        }
      }
    }'>
    <div data-component="AccordionItem" data-options='{ "isOpen": true }'>
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
</Preview>

```html{10-13,20}
<div
  data-component="Accordion"
  data-options='{
    "autoclose": false,
    "item": {
      "styles": {
        "container": {
          "active": "transition-all duration-500 ease-out-expo"
        },
        "icon": {
          "open": "transform rotate-180",
          "active": "transition duration-500 ease-out-expo"
        }
      }
    }
  }'>
  <div data-component="AccordionItem" data-options='{ "isOpen": true }'>
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

new Accordion(document.querySelector('.my-custom-accordion-element'));
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Accordion from '@studiometa/js-toolkit/components/Accordion';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Accordion,
      },
    };
  }
}

new App(document.documentElement);
```

You also can extend the class to create a component with extra capabilities. The following example adds custom style by default, enables the `move` options and add an option to auto-open the modal after a given delay:

```js
import AccordionCore from '@studiometa/js-toolkit/components/Accordion';

export default class Accordion extends AccordionCore {
  get config() {
    return {
      …super.config,
      autoclose: false,
    };
  }
}
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
Options can be defined per component via the `data-options` attribute or by extending the `Modal` class.
:::

#### `autoclose`

- Type: `Boolean`
- Default: `true`

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
