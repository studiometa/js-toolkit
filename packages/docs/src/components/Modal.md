---
sidebar: auto
sidebarDepth: 5
prev: /components/Cursor.md
next: /components/Tabs.md
---

# Modal

An accessible, flexible and responsive modal component, easy to use and easy to extend.

## Examples

### Simple

<Preview>
  <div data-component="Modal" class="text-center">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
        </div>
      </div>
    </div>
  </div>
  </div>
</Preview>

<<< @/src/components/Modal.template.html

### Autofocus

You can choose an item to focus when the modal opens by adding an `autofocus` attribute to an element inside the `modal` ref.

<Preview>
  <div data-component="Modal" class="text-center">
    <!--
      Modal opening trigger.
      This ref will be used to open the modal on click.
    -->
    <button data-ref="open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="content">
            <label class="block mb-2 text-left" for="input-firstname">Firstname</label>
            <input class="block w-64 mb-6 p-4 border" style="border-color: #eee;" id="input-firstname" type="text" autofocus placeholder="Firstname">
            <label class="block mb-2 text-left" for="input-lastname">Lastname</label>
            <input class="block w-64 p-4 border" style="border-color: #eee;" id="input-lastname" type="text" placeholder="Lastname">
          </div>
        </div>
      </div>
    </div>
  </div>
</Preview>

```html{37}
<div data-component="Modal">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="open" type="button" class="py-2 px-4 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="content">
          <label class="block mb-2 text-left" for="input-firstname">Firstname</label>
          <input autofocus class="block w-64 mb-6 p-4 border" style="border-color: #eee;" id="input-firstname" type="text" placeholder="Firstname">
          <label class="block mb-2 text-left" for="input-lastname">Lastname</label>
          <input class="block w-64 p-4 border" style="border-color: #eee;" id="input-lastname" type="text" placeholder="Lastname">
        </div>
      </div>
    </div>
  </div>
</div>
```

### Max height

<Preview>
  <div data-component="Modal" class="text-center">
    <!--
      Modal opening trigger.
      This ref will be used to open the modal on click.
    -->
    <button data-ref="open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="container" class="z-above relative overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto" style="max-height: 15rem;">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="content">
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
            <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</Preview>

```html{22}
<div data-component="Modal">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="open" type="button" class="py-2 px-4 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="container" style="max-height: 15rem;" class="z-above relative overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="content">
          <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
          <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
          <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
          <p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### With transitions

We reset the default styles for the `modal` ref and add some Tailwind classes to the `data-option-styles` along with classes to enable transforms and transitions on the `container` and `modal` refs.

<Preview>
  <div
    data-component="Modal"
    data-option-styles='{
      "modal": {
        "active": "transition-all duration-500 ease-out-expo",
        "closed": "opacity-0 pointer-events-none invisible"
      },
      "container": {
        "active": "transition duration-500 ease-out-expo",
        "closed": "transform scale-90"
      }
    }'
    class="text-center">
    <!--
      Modal opening trigger.
      This ref will be used to open the modal on click.
    -->
    <button data-ref="open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0 opacity-0 pointer-events-none invisible">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="content">
            <img class="block mx-auto mb-6" src="https://picsum.photos/500/300" alt="" width="500" height="300">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
          </div>
        </div>
      </div>
    </div>
  </div>
</Preview>

```html{3-12}
<div
  data-component="Modal"
  data-option-styles='{
    "modal": {
      "active": "transition-all duration-500 ease-out-expo",
      "closed": "opacity-0 pointer-events-none invisible"
    },
    "container": {
      "active": "transition duration-500 ease-out-expo",
      "closed": "transform scale-90"
    }
  }'
  class="text-center">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0 opacity-0 pointer-events-none invisible">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="content">
          <img class="block mx-auto mb-6" src="https://picsum.photos/500/300" alt="" width="500" height="300">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
        </div>
      </div>
    </div>
  </div>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Modal` class on an element:

```js
import Modal from '@studiometa/js-toolkit/components/Modal';

const modal = new Modal(document.querySelector('.my-custom-modal-element'));
modal.$mount();
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Modal,
    },
  };
}

const app = new App(document.documentElement);
app.$mount();
```

You also can extend the class to create a component with extra capabilities. The following example adds custom style by default, enables the `move` options and add an option to auto-open the modal after a given delay:

```js
import ModalCore from '@studiometa/js-toolkit/components/Modal';

export default class Modal extends ModalCore {
  static config = {
    ...ModalCore.config,
    options: {
      ...ModalCore.config.options,
      move: {
        type: String,
        default: 'body',
      },
      autoOpen: {
        type: Number,
        default: 5000,
      },
      styles: {
        type: Object,
        default: () => ({
          modal: {
            closed: 'hidden'
          },
        }),
      },
    },
  }

  mounted() {
    super.mounted();

    if (this.$options.autoOpen) {
      this.timer = setTimeout(() => this.open(), this.$options.autoOpen);
    }
  }

  destroyed() {
    super.destroyed();
    clearTimeout(this.timer);
  }
}
```

Programmatic usage of a modal component should be made from a parent component:

```js
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';

/**
 * Based on the following HTML:
 *
 * <div data-component="MyPage">
 *   <div data-component="Modal" data-ref="modal">
 *     ...
 *   </div>
 * </div>
 */

class MyPage extends Base {
  static config = {
    name: 'MyPage',
    components: { Modal },
  };


  mounted() {
    // Wait for 5s before opening the modal component stored as a ref.
    setTimeout(() => {
      this.$refs.modal.open();
    }, 5000);
  }
}
```


### HTML

The following HTML is required for the `Modal` component:

```html
<div data-component="Modal">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="open" type="button">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="overlay" tabindex="-1" class="z-under absolute inset-0"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="close" type="button">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div data-ref="content">
          <!-- ... -->
        </div>
      </div>
    </div>
  </div>
</div>
```

## API

### Refs

#### `Modal.open`

This ref will be the button used to open the modal.

#### `Modal.modal`

This ref is the main modal element.

#### `Modal.overlay`

This ref is used as the modal's background.

#### `Modal.container`

This ref is used to center the content.

#### `Modal.close`

This ref is placed inside the container and is used to close the modal.

#### `Modal.content`

This ref will hold the modal's dynamic content.

### Options

::: tip
Options can be defined per component via the `data-option-<option-name>` attributes or by extending the `Modal` class.
:::

#### `move`

- Type: `Boolean`, `String`
- Default: `false`

A selector or a boolean to move the `Modal.modal` element in the DOM. A value of `false` will keep the element in place, `true` will append the element to `document.body` and a string selector will append the element to the first matching element for the given selector.

#### `autofocus`

- Type: `String`, `Boolean`
- Default: `[autofocus]`

A selector or a boolean to autofocus an element when the modal opens. If `false`, the behaviour is disabled.

#### `styles`

- Type: `Object`
- Default:

```js
{
  modal: {
    open: undefined, // Classes or styles for the `open` state
    active: undefined, // Used to add transition between the states
    closed: { // Default styles for the `closed` state
      opacity: 0,
      pointerEvents: 'none',
      visibility: 'hidden',
    },
  },
}
```

The `styles` options should be used to apply custom classes or styles to any refs for their `open` or `closed` states.

### Methods

#### `open`

Open the modal, returns a Promise resolving when the opening transitions are finished.

#### `close`

Close the modal, returns a Promise resolving when the closing transitions are finished.

### Events

#### `open`

Emitted when the modal opens.

#### `close`

Emitted when the modal closes.
