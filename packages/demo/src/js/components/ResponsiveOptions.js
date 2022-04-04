import { Base } from '@studiometa/js-toolkit';

/**
 * ResponsiveOptions class.
 */
export default class ResponsiveOptions extends Base {
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

  print() {
    this.$el.innerHTML = `${this.$services.get('resized').breakpoint}<br>${JSON.stringify(
      this.$options,
      null,
      2
    )}`;
  }

  mounted() {
    this.print();
  }

  resized() {
    this.print();
  }
}
