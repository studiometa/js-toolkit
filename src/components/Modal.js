import Base from '../abstracts/Base';
import * as classes from '../utils/css/classes';
import * as styles from '../utils/css/styles';
import focusTrap from '../utils/focusTrap';

const { trap, untrap, saveActiveElement } = focusTrap();

/**
 * Modal class.
 */
export default class Modal extends Base {
  /**
   * Modal options.
   */
  get config() {
    return {
      name: 'Modal',
      move: false,
      autofocus: '[autofocus]',
      openClass: {},
      openStyle: {},
      closedClass: {},
      closedStyle: {
        modal: {
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        },
      },
    };
  }

  /**
   * Open the modal on click on the `open` ref.
   *
   * @return {Function} The component's `open` method.
   */
  get onOpenClick() {
    return this.open;
  }

  /**
   * Close the modal on click on the `close` ref.
   *
   * @return {Function} The component's `close` method.
   */
  get onCloseClick() {
    return this.close;
  }

  /**
   * Close the modal on click on the `overlay` ref.
   *
   * @return {Function} The component's `close` method.
   */
  get onOverlayClick() {
    return this.close;
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {Modal} The current instance.
   */
  mounted() {
    this.isOpen = false;
    this.close();

    if (this.$options.move) {
      const target = document.querySelector(this.$options.move) || document.body;
      const refsBackup = this.$refs;

      this.refModalPlaceholder = document.createComment('');
      this.refModalParentBackup = this.$refs.modal.parentElement || this.$el;
      this.refModalParentBackup.insertBefore(this.refModalPlaceholder, this.$refs.modal);

      this.refModalUnbindGetRefFilter = this.$on('get:refs', refs => {
        Object.entries(refsBackup).forEach(([key, ref]) => {
          if (!refs[key]) {
            refs[key] = ref;
          }
        });
      });
      target.appendChild(this.$refs.modal);
    }

    return this;
  }

  /**
   * Unbind all events on destroy.
   *
   * @return {Modal} The Modal instance.
   */
  destroyed() {
    this.close();

    if (this.$options.move) {
      this.refModalParentBackup.insertBefore(this.$refs.modal, this.refModalPlaceholder);
      this.refModalUnbindGetRefFilter();
      this.refModalPlaceholder.remove();
      delete this.refModalPlaceholder;
      delete this.refModalParentBackup;
      delete this.refModalUnbindGetRefFilter;
    }

    return this;
  }

  /**
   * Close the modal on `ESC` and trap the tabulation.
   *
   * @param  {KeyboardEvent} options.event  The original keyboard event
   * @param  {Boolean}       options.isUp   Is it a keyup event?
   * @param  {Boolean}       options.isDown Is it a keydown event?
   * @param  {Boolean}       options.ESC    Is it the ESC key?
   * @return {void}
   */
  keyed({ event, isUp, isDown, ESC }) {
    if (!this.isOpen) {
      return;
    }

    if (isDown) {
      trap(this.$refs.modal, event);
    }

    if (ESC && isUp) {
      this.close();
    }
  }

  /**
   * Open the modal.
   *
   * @return {Modal} The Modal instance.
   */
  open() {
    this.$refs.modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    // Add "open" classes to refs
    Object.entries(this.$options.openClass).forEach(([ref, classNames]) => {
      classes.add(this.$refs[ref], classNames);
    });

    // Add "open" styles to refs
    Object.entries(this.$options.openStyle).forEach(([ref, styleProps]) => {
      styles.add(this.$refs[ref], styleProps);
    });

    // Remove "closed" classes from refs
    Object.entries(this.$options.closedClass).forEach(([ref, classNames]) => {
      classes.remove(this.$refs[ref], classNames);
    });

    // Remove "closed" styles from refs
    Object.entries(this.$options.closedStyle).forEach(([ref, styleProps]) => {
      styles.remove(this.$refs[ref], styleProps);
    });

    if (this.$options.autofocus && this.$refs.modal.querySelector(this.$options.autofocus)) {
      saveActiveElement();
      this.$refs.modal.querySelector(this.$options.autofocus).focus();
    }

    this.isOpen = true;
    this.$emit('open');
  }

  /**
   * Close the modal.
   *
   * @return {Modal} The Modal instance.
   */
  close() {
    this.$refs.modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';

    // Add "closed" classes to refs
    Object.entries(this.$options.closedClass).forEach(([ref, classNames]) => {
      classes.add(this.$refs[ref], classNames);
    });

    // Add "closed" styles to refs
    Object.entries(this.$options.closedStyle).forEach(([ref, styleProps]) => {
      styles.add(this.$refs[ref], styleProps);
    });

    // Remove "open" classes from refs
    Object.entries(this.$options.openClass).forEach(([ref, classNames]) => {
      classes.remove(this.$refs[ref], classNames);
    });

    // Remove "open" styles from refs
    Object.entries(this.$options.openStyle).forEach(([ref, styleProps]) => {
      styles.remove(this.$refs[ref], styleProps);
    });

    this.isOpen = false;
    untrap();
    this.$emit('close');
  }
}
