import Base from '../abstracts/Base';
import transition from '../utils/css/transition';
import focusTrap from '../utils/focusTrap';

const { trap, untrap, saveActiveElement } = focusTrap();

/**
 * @typedef {import('../abstracts/Base/index').default} Base
 * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
 */

/**
 * Modal class.
 */
export default class Modal extends Base {
  /**
   * Modal options
   * @type {BaseOptions & { move?: boolean, autofocus?: string, styles?: object }}
   */
  $options;

  /**
   * State of the modal.
   * @type {Boolean}
   */
  isOpen;

  /**
   * The modal content placeholder when its content is moved.
   * @type {Comment}
   */
  refModalPlaceholder;

  /**
   * A reference to the modal's parent to be used as backup.
   * @type {HTMLElement}
   */
  refModalParentBackup;

  /**
   * Unbind function to remove the `get:refs` hook binding.
   * @type {Function}
   */
  refModalUnbindGetRefFilter;

  /**
   * Modal options.
   */
  static config = {
    name: 'Modal',
    refs: ['close', 'container', 'content', 'modal', 'open', 'overlay'],
    move: '',
    autofocus: '[autofocus]',
    styles: {
      modal: {
        closed: {
          opacity: 0,
          pointerEvents: 'none',
          visibility: 'hidden',
        },
      },
    },
  };

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

      this.refModalUnbindGetRefFilter = this.$on('get:refs', (refs) => {
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
  async open() {
    if (this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    this.isOpen = true;
    this.$emit('open');

    return Promise.all(
      // @ts-ignore
      Object.entries(this.$options.styles).map(([refName, { open, active, closed } = {}]) =>
        transition(
          this.$refs[refName],
          {
            from: closed,
            active,
            to: open,
          },
          'keep'
        )
      )
    ).then(() => {
      if (this.$options.autofocus && this.$refs.modal.querySelector(this.$options.autofocus)) {
        saveActiveElement();
        this.$refs.modal.querySelector(this.$options.autofocus).focus();
      }
      return Promise.resolve(this);
    });
  }

  /**
   * Close the modal.
   *
   * @return {Modal} The Modal instance.
   */
  async close() {
    if (!this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.modal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';

    this.isOpen = false;
    untrap();
    this.$emit('close');

    return Promise.all(
      // @ts-ignore
      Object.entries(this.$options.styles).map(([refName, { open, active, closed } = {}]) =>
        transition(
          this.$refs[refName],
          {
            from: open,
            active,
            to: closed,
          },
          'keep'
        )
      )
    ).then(() => Promise.resolve(this));
  }
}
