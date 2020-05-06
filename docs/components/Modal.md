---
sidebar: auto
sidebarDepth: 5
prev: /components/
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
    <button data-ref="Modal.open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="Modal.container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
          </div>
        </div>
      </div>
    </div>
  </div>
</Preview>

```html
<div data-component="Modal">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="Modal.open" type="button" class="py-2 px-4 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="Modal.container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
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
    <button data-ref="Modal.open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="Modal.container" class="z-above relative overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto" style="max-height: 15rem;">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
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
  <button data-ref="Modal.open" type="button" class="py-2 px-4 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" style="opacity: 0; pointer-events: none; visibility: hidden;" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="Modal.container" style="max-height: 15rem;" class="z-above relative overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
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

We reset the default styles for the `modal` ref and add some Tailwind classes to the `data-options` along with classes to enable transforms and transitions on the `container` and `modal` refs.

<Preview>
  <div
    data-component="Modal"
    data-options='{
      "closedClass": {
        "modal": "opacity-0 pointer-events-none invisible",
        "container": "scale-90"
      },
      "closedStyle": {
        "modal": {}
      }
    }'
    class="text-center">
    <!--
      Modal opening trigger.
      This ref will be used to open the modal on click.
    -->
    <button data-ref="Modal.open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
      Open
    </button>
    <!-- Modal element -->
    <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0 opacity-0 pointer-events-none invisible transition-all duration-500 ease-out-expo">
      <!--
        Modal overlay
        The `tabindex="-"` attribute is required.
      -->
      <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <!--
          Modal container
          This is the element in which the user can scroll
          if the content of the modal is too long.
        -->
        <div data-ref="Modal.container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto transform transition duration-500 ease-out-expo">
          <!--
            Modal close button
            This will be used to close the modal on click.
          -->
          <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
            Close
          </button>
          <!--
            Modal content
            The content displayed in the modal.
            The `max-w-3xl` class defines the modal width.
          -->
          <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
            <img class="block mx-auto mb-6" src="https://picsum.photos/500/300" alt="" width="500" height="300">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae laudantium sint culpa sequi enim <a href="#" class="border-b">quaerat</a> itaque possimus at <a href="#" class="border-b">voluptatem</a> voluptates voluptatum velit illum nulla, optio porro ea. Doloremque, aut, beatae!
          </div>
        </div>
      </div>
    </div>
  </div>
</Preview>

```html{3-11,21,33}
<div
  data-component="Modal"
  data-options='{
    "closedClass": {
      "modal": "opacity-0 pointer-events-none invisible",
      "container": "scale-90"
    },
    "closedStyle": {
      "modal": {}
    }
  }'
  class="text-center">
  <!--
    Modal opening trigger.
    This ref will be used to open the modal on click.
  -->
  <button data-ref="Modal.open" type="button" class="py-4 px-8 text-white rounded bg-black focus:opacity-50">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0 opacity-0 pointer-events-none invisible transition-all duration-500 ease-out-expo">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0 bg-black opacity-75"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="Modal.container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white rounded shadow-l pointer-events-auto transform transition duration-500 ease-out-expo">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="Modal.close" type="button" class="absolute top-0 right-0 m-2 py-2 px-4 text-white rounded bg-black focus:opacity-50">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div class="max-w-3xl p-10 pt-16" data-ref="Modal.content">
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
import { Modal } from '@studiometa/js-toolkit';

new Modal(document.querySelector('.my-custom-modal-element'));
```

Or you can use the component as a child of another one:

```js
import { Base, Modal } from '@studiometa/js-toolkit';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Modal,
      },
    };
  }
}

new App(document.documentElement);
```

You also can extend the class to create a styled `Modal`:

```js
import { Modal } from '@studiometa/js-toolkit';

class CustoModal extends Modal {
  get config() {
    return {
      name: 'CustomModal',
      move: true,
      closedClass: {
        modal: 'hidden',
      },
    };
  }
}
```

Programmatic usage of a modal component should be made from a parent component:

```js
import { Base, Modal } from '@studiometa/js-toolkit';

/**
 * Based on the following HTML:
 *
 * <div data-component="MyPage">
 *   <div data-component="Modal" data-ref="MyPage.modal">
 *     ...
 *   </div>
 * </div>
 */

class MyPage extends Base {
  get config() {
    return {
      name: 'MyPage',
      components: { Modal },
    };
  }

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
  <button data-ref="Modal.open" type="button">
    Open
  </button>
  <!-- Modal element -->
  <div data-ref="Modal.modal" role="dialog" aria-modal="true" aria-hidden="true" class="z-goku fixed inset-0">
    <!--
      Modal overlay
      The `tabindex="-"` attribute is required.
    -->
    <div data-ref="Modal.overlay" tabindex="-1" class="z-under absolute inset-0"></div>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <!--
        Modal container
        This is the element in which the user can scroll
        if the content of the modal is too long.
      -->
      <div data-ref="Modal.container" class="z-above relative max-h-full overflox-x-hidden overflow-y-auto bg-white pointer-events-auto">
        <!--
          Modal close button
          This will be used to close the modal on click.
        -->
        <button data-ref="Modal.close" type="button">
          Close
        </button>
        <!--
          Modal content
          The content displayed in the modal.
          The `max-w-3xl` class defines the modal width.
        -->
        <div data-ref="Modal.content">
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
Options can be defined per component via the `data-options` attribute or by extending the Tabs class.
:::

#### `move`

- Type: `Boolean`, `String`
- Default: `false`

A selector or a boolean to move the `Modal.modal` element in the DOM. A value of `false` will keep the element in place, `true` will append the element to `document.body` and a string selector will append the element to the first matching element for the given selector.

#### `openClass`

- Type: `Object`
- Default: `{}`

An object which keys are refs names and values are classes (`String`) that will be added to the refs when the modal opens.

#### `openStyle`

- Type: `Object`
- Default: `{}`

An object which keys are refs names and values are style definition (`CSSStyleDeclaration`) that will be added to the refs when the modal opens.

#### `closedClass`

- Type: `Object`
- Default: `{}`

An object which keys are refs names and values are classes (`String`) that will be added to the refs when the modal closes.

#### `closedStyle`

- Type: `Object`
- Default: `{ modal: { opacity: 0, pointerEvents: 'none', visibility: 'hidden' } }`

An object which keys are refs names and values are style definition (`CSSStyleDeclaration`) that will be added to the refs when the modal closes.
