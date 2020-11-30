---
sidebar: auto
sidebarDepth: 5
prev: /components/Tabs.md
next: false
---

# Tooltip

An accessible, flexible and responsive tooltip component, easy to use and easy to extend.

## Examples

### Simple

<Preview>
  <div>
    Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus
    <div data-component="Tooltip" class="tooltip relative inline-block">
      <!--
        Tooltip opening trigger.
        This ref will be used to open the tooltip on mouseenter / focus.
        The `tabindex="-"` attribute is required.
      -->
      <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
        Tooltip trigger
      </span>
      <!-- Container element -->
      <div data-ref="container" class="absolute z-above" aria-hidden="true">
        <!--
          Tooltip content
          The content displayed in the tooltip.
          The `w-40` class defines the tooltip width.
        -->
        <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
          Tooltip content...
        </div>
      </div>
    </div>
    lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus. Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus.
  </div>
</Preview>

<<< @/docs/components/Tooltip.template.html

### Opened by default

<Preview>
  <div>
    Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus
    <div
      data-component="Tooltip" class="tooltip relative inline-block"
      data-options='{"open": true}'>
      <!--
        Tooltip opening trigger.
        This ref will be used to open the tooltip on mouseenter / focus.
        The `tabindex="-"` attribute is required.
      -->
      <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
        Tooltip trigger
      </span>
      <!-- Container element -->
      <div data-ref="container" class="absolute z-above" aria-hidden="true">
        <!--
          Tooltip content
          The content displayed in the tooltip.
          The `w-40` class defines the tooltip width.
        -->
        <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
          Tooltip content...
        </div>
      </div>
    </div>
    lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus. Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus.
  </div>
</Preview>

```html{3}
<div
  data-component="Tooltip" class="tooltip relative inline-block"
  data-options='{"open": true}'>
  <!--
    Tooltip opening trigger.
    This ref will be used to open the tooltip on mouseenter / focus.
    The `tabindex="-"` attribute is required.
  -->
  <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
    Tooltip trigger
  </span>
  <!-- Container element -->
  <div data-ref="container" class="absolute z-above" aria-hidden="true">
    <!--
      Tooltip content
      The content displayed in the tooltip.
      The `w-40` class defines the tooltip width.
    -->
    <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
      Tooltip content...
    </div>
  </div>
</div>
```

### Viewport offset (navbar offset)

<Preview>
  <div>
    Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus
    <div
      data-component="Tooltip" class="tooltip relative inline-block"
      data-options='{"offset": 50}'>
      <!--
        Tooltip opening trigger.
        This ref will be used to open the tooltip on mouseenter / focus.
        The `tabindex="-"` attribute is required.
      -->
      <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
        Tooltip trigger
      </span>
      <!-- Container element -->
      <div data-ref="container" class="absolute z-above" aria-hidden="true">
        <!--
          Tooltip content
          The content displayed in the tooltip.
          The `w-40` class defines the tooltip width.
        -->
        <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
          Tooltip content...
        </div>
      </div>
    </div>
    lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus. Proin volutpat efficitur ultricies. Aliquam vitae est vel felis vestibulum dapibus. Donec sed finibus turpis. Suspendisse ac ante semper, pulvinar justo ut, convallis justo. Ut auctor nisl id orci accumsan, sodales semper ante ornare. Nullam et ligula vel lacus commodo sagittis. Etiam at massa non nunc pulvinar rhoncus a eu justo. Aliquam erat volutpat. Integer tincidunt, dui quis imperdiet auctor, mauris tellus bibendum augue, ac ullamcorper elit sem eget nisl. Sed finibus lorem vitae est blandit consequat. Praesent et tristique neque. Vivamus at nisl vitae justo sodales imperdiet et sed tellus.
  </div>
</Preview>

```html{3}
<div
  data-component="Tooltip" class="tooltip relative inline-block"
  data-options='{"offset": 50}'>
  <!--
    Tooltip opening trigger.
    This ref will be used to open the tooltip on mouseenter / focus.
    The `tabindex="-"` attribute is required.
  -->
  <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
    Tooltip trigger
  </span>
  <!-- Container element -->
  <div data-ref="container" class="absolute z-above" aria-hidden="true">
    <!--
      Tooltip content
      The content displayed in the tooltip.
      The `w-40` class defines the tooltip width.
    -->
    <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
      Tooltip content...
    </div>
  </div>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Tooltip` class on an element:

```js
import Tooltip from '@studiometa/js-toolkit/components/Tooltip';

new Tooltip(document.querySelector('.my-custom-tooltip-element'));
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Tooltip from '@studiometa/js-toolkit/components/Tooltip';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Tooltip,
      },
    };
  }
}

new App(document.documentElement);
```

You also can extend the class to create a component with extra capabilities. The following example adds custom style by default, enables the `open` options and add an option to auto-close the tooltip after a given delay:

```js
import TooltipCore from '@studiometa/js-toolkit/components/Tooltip';

export default class Tooltip extends TooltipCore {
  get config() {
    return {
      ...super.config,
      open: true,
      autoClose: 5000,
      styles: {
        container: {
          closed: 'hidden',
        },
      },
    };
  }

  mounted() {
    super.mounted();

    if (this.$options.autoClose) {
      this.timer = setTimeout(() => this.close(), this.$options.autoClose);
    }
  }

  destroyed() {
    super.destroyed();

    clearTimeout(this.timer);
  }
}
```

Programmatic usage of a tooltip component should be made from a parent component:

```js
import Base from '@studiometa/js-toolkit';
import Tooltip from '@studiometa/js-toolkit/components/Tooltip';

/**
 * Based on the following HTML:
 *
 * <div data-component="MyPage">
 *   <div data-component="Tooltip" data-ref="tooltip">
 *     ...
 *   </div>
 * </div>
 */

class MyPage extends Base {
  get config() {
    return {
      name: 'MyPage',
      components: { Tooltip },
    };
  }

  mounted() {
    // Wait for 5s before opening the tooltip component stored as a ref.
    setTimeout(() => {
      this.$refs.tooltip.open();
    }, 5000);
  }
}
```


### HTML

The following HTML is required for the `Tooltip` component:

```html
<div data-component="Tooltip" class="tooltip relative inline-block">
  <!--
    Tooltip opening trigger.
    This ref will be used to open the tooltip on mouseenter / focus.
    The `tabindex="-"` attribute is required.
  -->
  <span type="button" data-ref="trigger" tabindex="0" class="font-semibold underline">
    Tooltip trigger
  </span>
  <!-- Container element -->
  <div data-ref="container" class="absolute z-above" aria-hidden="true">
    <!--
      Tooltip content
      The content displayed in the tooltip.
      The `w-40` class defines the tooltip width.
    -->
    <div data-ref="content" class="absolute w-40 p-4 bg-black text-white" role="tooltip">
      Tooltip content...
    </div>
  </div>
</div>
```

## API

### Refs

#### `Tooltip.open`

This ref will be the button used to open the tooltip.

#### `Tooltip.container`

This ref is the main tooltip element.

#### `Tooltip.content`

This ref will hold the tooltip's dynamic content.

### Options

::: tip
Options can be defined per component via the `data-options` attribute or by extending the `Tooltip` class.
:::

#### `open`

- Type: `Boolean`
- Default: `false`

A boolean to open tooltip on mount. A value of `false` will hide the element by default, `true` will show tooltip content and prevent close.

#### `offset`

- Type: `Number`
- Default: `0`

An integer who defined the offset between the tooltip content and the viewport (usefull for fixed navbar for example).

#### `styles`

- Type: `Object`
- Default:

```js
{
  container: {
    open: undefined, // Classes or styles for the `open` state
    closed: { // Default styles for the `closed` state
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
    },
    top: {
      top: 'auto',
      bottom: '100%',
      left: '50%',
    },
    bottom: {
      top: '100%',
      bottom: 'auto',
      left: '50%',
    }
  },
}
```

The `styles` options should be used to apply custom classes or styles to any refs for their `open`, `closed`, `top` or `bottom` states.

### Methods

#### `open`

Open the tooltip, returns a Promise resolving when the opening transitions are finished.

#### `close`

Close the tooltip, returns a Promise resolving when the closing transitions are finished.

#### `setPosition`

Set the tooltip position, returns a Promise resolving when the transitions are finished.

### Events

#### `open`

Emitted when the tooltip opens.

#### `close`

Emitted when the tooltip closes.
