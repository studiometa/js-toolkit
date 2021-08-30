import Base from '../abstracts/Base/index.js';
import transition from '../utils/css/transition.js';
import { trap, untrap, saveActiveElement } from '../utils/focusTrap.js';

/**
 * @typedef {Object} ModalRefs
 * @property {HTMLElement} close
 * @property {HTMLElement} container
 * @property {HTMLElement} content
 * @property {HTMLElement} modal
 * @property {HTMLElement} open
 * @property {HTMLElement} overlay
 */

/**
 * @typedef {import('../utils/css/styles.js').CssStyleObject} CssStyleObject
 * @typedef {Partial<Record<'open'|'active'|'closed', string|CssStyleObject>>} ModalStates
 * @typedef {Partial<Record<keyof ModalRefs, ModalStates>>} ModalStylesOption
 */

/**
 * @typedef {Object} ModalOptions
 * @property {String}            move      A selector where to move the modal to.
 * @property {String}            autofocus A selector for the element to set the focus to when the modal opens.
 * @property {ModalStylesOption} styles    The styles for the different state of the modal.
 */

/**
 * @typedef {Object} ModalPrivateInterface
 * @property {ModalRefs} $refs
 * @property {ModalOptions} $options
 * @property {Boolean} isOpen
 * @property {Comment} refModalPlaceholder
 * @property {HTMLElement} refModalParentBackup
 * @property {Function} refModalUnbindGetRefFilter
 */

/**
 * @typedef {Modal & ModalPrivateInterface} ModalInterface
 */

/**
 * Modal class.
 */
export default class Modal extends Base {
  /**
   * Modal options.
   */
  static config = {
    name: 'Modal',
    refs: ['close', 'container', 'content', 'modal', 'open', 'overlay'],
    options: {
      move: String,
      autofocus: { type: String, default: '[autofocus]' },
      styles: {
        type: Object,
        /**
         * @return {ModalStylesOption}
         */
        default: () => ({
          modal: {
            closed: {
              opacity: '0',
              pointerEvents: 'none',
              visibility: 'hidden',
            },
          },
        }),
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
   * @this {ModalInterface}
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

      this.refModalUnbindGetRefFilter = this.$on(
        'get:refs',
        /**
         * @param {ModalRefs} refs
         */
        (refs) => {
          Object.entries(refsBackup).forEach(([key, ref]) => {
            if (!refs[key]) {
              refs[key] = ref;
            }
          });
        }
      );
      target.appendChild(this.$refs.modal);
    }

    return this;
  }

  /**
   * Unbind all events on destroy.
   *
   * @this {ModalInterface}
   * @return {Modal} The Modal instance.
   */
  destroyed() {
    this.close();

    if (this.$options.move && this.refModalParentBackup) {
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
   * @this {ModalInterface}
   * @param  {Object}        options
   * @param  {KeyboardEvent} options.event  The original keyboard event
   * @param  {Boolean}       options.isUp   Is it a keyup event?
   * @param  {Boolean}       options.isDown Is it a keydown event?
   * @param  {Boolean}       options.ESC    Is it the ESC key?
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
   * @this {ModalInterface}
   * @return {Promise<ModalInterface>} The Modal instance.
   */
  async open() {
    if (this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    this.isOpen = true;
    this.$emit('open');

    /** @type {ModalRefs} */
    const refs = this.$refs;

    return Promise.all(
      Object.entries(this.$options.styles).map(
        ([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            refs[refName],
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
        /** @type {HTMLElement} */
        const autofocusElement = this.$refs.modal.querySelector(this.$options.autofocus);
        autofocusElement.focus();
      }
      return Promise.resolve(this);
    });
  }

  /**
   * Close the modal.
   *
   * @this {ModalInterface}
   * @return {Promise<ModalInterface>} The Modal instance.
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

    /** @type {ModalRefs} */
    const refs = this.$refs;

    return Promise.all(
      Object.entries(this.$options.styles).map(
        ([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            refs[refName],
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
