# Modal / Dialog

A modal dialog with open/close behaviour, backdrop overlay, focus trapping, and Escape to close. This example demonstrates refs, events, the `keyed` service hook, and the `trapFocus` / `untrapFocus` utilities.

## What we're building

A button that opens a modal dialog. When open, the modal:

- Displays a backdrop overlay
- Traps keyboard focus inside the dialog (Tab cycles through focusable elements)
- Closes on Escape key press
- Closes when clicking the backdrop or a close button
- Restores focus to the trigger button on close

## HTML markup

The trigger button and the modal markup live inside the same component. The `backdrop` and `dialog` are separate refs. The dialog has `role="dialog"` and `aria-modal="true"` for accessibility:

```html
<div data-component="Modal">
  <button data-ref="openBtn">Open Modal</button>

  <div data-ref="backdrop" class="modal-backdrop" hidden>
    <div
      data-ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <h2 id="modal-title">Modal Title</h2>
      <p>This is the modal content. Focus is trapped inside.</p>
      <button data-ref="closeBtn">Close</button>
    </div>
  </div>
</div>
```

Add some basic CSS to position the backdrop and dialog:

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-backdrop [role='dialog'] {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
}
```

## JavaScript component

The component uses `trapFocus` from `@studiometa/js-toolkit/utils` to keep Tab navigation inside the dialog, and `untrapFocus` to restore focus on close. The `keyed` hook listens for Escape:

```js
import { Base } from '@studiometa/js-toolkit';
import {
  trapFocus,
  untrapFocus,
  keyCodes,
} from '@studiometa/js-toolkit/utils';

export default class Modal extends Base {
  static config = {
    name: 'Modal',
    refs: ['openBtn', 'closeBtn', 'backdrop', 'dialog'],
  };

  isOpen = false;

  /**
   * Open the modal when the open button is clicked.
   */
  onOpenBtnClick() {
    this.open();
  }

  /**
   * Close the modal when the close button is clicked.
   */
  onCloseBtnClick() {
    this.close();
  }

  /**
   * Close the modal when clicking the backdrop (but not the dialog itself).
   */
  onBackdropClick({ event }) {
    if (event.target === this.$refs.backdrop) {
      this.close();
    }
  }

  /**
   * Close on Escape key press.
   */
  keyed(props) {
    if (this.isOpen && props.ESC && props.isDown) {
      this.close();
    }

    // Trap focus inside the dialog while open
    if (this.isOpen && props.event.keyCode === keyCodes.TAB) {
      trapFocus(this.$refs.dialog, props.event);
    }
  }

  /**
   * Show the modal and trap focus.
   */
  open() {
    this.isOpen = true;
    this.$refs.backdrop.hidden = false;
    // Focus the first focusable element inside the dialog
    this.$refs.dialog.focus?.() ||
      this.$refs.dialog
        .querySelector('button, [href], input, select, textarea')
        ?.focus();
  }

  /**
   * Hide the modal and restore focus.
   */
  close() {
    this.isOpen = false;
    this.$refs.backdrop.hidden = true;
    untrapFocus(); // Restores focus to the element focused before the modal opened
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Modal from './Modal.js';

registerComponent(Modal);
```

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — connecting DOM elements to components
- [Events guide](/guide/introduction/working-with-events.html) — `on<Ref>Click` event handlers
- [Services guide](/guide/introduction/using-services.html) — the `keyed` service hook
- [`trapFocus` utility](/utils/trapFocus.html) — trap Tab navigation inside an element
- [`keyCodes` utility](/utils/keyCodes.html) — key code constants
- [Teleport refs example](/examples/teleport-refs/) — moving modal elements to `<body>`
