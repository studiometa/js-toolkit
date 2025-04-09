import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';

/**
 * ResponsiveOptions class.
 */
export default class ResponsiveOptions extends withResponsiveOptions(Base) {
  /**
   * Config.
   */
  static config = {
    name: 'ResponsiveOptions',
    options: {
      fooBar: {
        type: String,
        responsive: true,
      },
    },
  };

  /**
   * Mounted hook.
   * @returns {void}
   */
  mounted() {
    this.print();
  }

  /**
   * Resized hook.
   * @returns {void}
   */
  resized() {
    this.print();
  }

  /**
   * Print data to the DOM.
   * @returns {void}
   */
  print() {
    this.$el.innerHTML = `${this.$services.get('resized').breakpoint}<br>${JSON.stringify(
      this.$options,
      null,
      2,
    )}`;
  }
}
