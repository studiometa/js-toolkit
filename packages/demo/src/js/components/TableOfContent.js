import TableOfContentCore from '@studiometa/js-toolkit/components/TableOfContent';

export default class TableOfContent extends TableOfContentCore {
  static config = {
    ...super.config,
    log: true,
  };

  offset = 0;

  /**
   * Scroll to the section.
   *
   * @param {string} id of the target section.
   *
   * @return {void}
   */
  scrollTo(id) {
    const section = this.$refs.sections.find((s) => s.id === id);
    const scrollY =
      (window.pageYOffset || document.documentElement.scrollTop) +
      section.getBoundingClientRect().top;

    if (section) {
      window.scroll(0, scrollY - this.offset);
    }
  }

  /**
   * Resized.
   *
   * @param {String} breakpoint
   *
   * @return {void}
   */
  resized({ breakpoint }) {
    if (!['xxs', 's'].includes(breakpoint)) {
      this.offset = 0;
    } else {
      this.offset = this.$refs.nav.getBoundingClientRect().height;
    }
  }
}
