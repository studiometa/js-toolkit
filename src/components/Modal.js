import { Base } from '../abstracts';
import { isObject, keyCodes, tabTrap } from '../utils';

const { trap, untrap } = tabTrap();

/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @param {String}      method     The method to use: add, remove or toggle.
 */
function setClasses(element, classNames, method = 'add') {
  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(className => {
    element.classList[method](className);
  });
}

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}         element The element to update.
 * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
 * @param {String}              method  The method to use: add or remove.
 */
function setStyles(element, styles, method = 'add') {
  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(([prop, value]) => {
    element.style[prop] = method === 'add' ? value : '';
  });
}

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
   * Initialize the component's behaviours.
   *
   * @return {Modal} The current instance.
   */
  mounted() {
    this.isOpen = false;
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this.keydownHandler = this.keydownHandler.bind(this);
    this.$refs.btn.addEventListener('click', this.open);
    this.$refs.close.addEventListener('click', this.close);
    this.$refs.overlay.addEventListener('click', this.close);
    this.close();

    if (this.$options.move) {
      const target = document.querySelector(this.$options.move) || document.body;
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
    this.$refs.btn.removeEventListener('click', this.open);
    this.$refs.close.removeEventListener('click', this.close);
    this.$refs.overlay.removeEventListener('click', this.close);
    return this;
  }

  /**
   * Open the modal.
   *
   * @return {Modal} The Modal instance.
   */
  open() {
    this.$refs.modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', this.keydownHandler);

    // Add "open" classes to refs
    Object.entries(this.$options.openClass).forEach(([ref, classes]) => {
      setClasses(this.$refs[ref], classes);
    });

    // Add "open" styles to refs
    Object.entries(this.$options.openStyle).forEach(([ref, styles]) => {
      setStyles(this.$refs[ref], styles);
    });

    // Remove "closed" classes from refs
    Object.entries(this.$options.closedClass).forEach(([ref, classes]) => {
      setClasses(this.$refs[ref], classes, 'remove');
    });

    // Remove "closed" styles from refs
    Object.entries(this.$options.closedStyle).forEach(([ref, styles]) => {
      setStyles(this.$refs[ref], styles, 'remove');
    });

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
    document.removeEventListener('keydown', this.keydownHandler);

    // Add "closed" classes to refs
    Object.entries(this.$options.closedClass).forEach(([ref, classes]) => {
      setClasses(this.$refs[ref], classes);
    });

    // Add "closed" styles to refs
    Object.entries(this.$options.closedStyle).forEach(([ref, styles]) => {
      setStyles(this.$refs[ref], styles);
    });

    // Remove "open" classes from refs
    Object.entries(this.$options.openClass).forEach(([ref, classes]) => {
      setClasses(this.$refs[ref], classes, 'remove');
    });

    // Remove "open" styles from refs
    Object.entries(this.$options.openStyle).forEach(([ref, styles]) => {
      setStyles(this.$refs[ref], styles, 'remove');
    });

    this.isOpen = false;
    untrap();
    this.$emit('close');
  }

  /**
   * Manage closing the modal on `ESC` keydown and trapped tabulation.
   *
   * @param  {Event} event The event object.
   * @return {Modal}       The Modal instance.
   */
  keydownHandler(event) {
    if (event.keyCode === keyCodes.ESC) {
      return this.close();
    }

    // Trap tab navigation
    trap(this.$refs.modal, event);

    return this;
  }
}
