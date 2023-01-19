import { Base, withScrolledInView } from '@studiometa/js-toolkit';

/**
 * ScrolledInViewOffset class.
 */
export default class ScrolledInViewOffset extends withScrolledInView(Base) {
  /**
   * Config.
   */
  static config = {
    name: 'ScrolledInViewOffset',
    refs: ['progress'],
  };

  /**
   * Scrolled in view.
   * @param   {import('@studiometa/js-toolkit').ScrolledInViewProps} props
   * @returns {void}
   */
  scrolledInView(props) {
    const { x, y } = props.progress;
    this.$refs.progress.textContent = `{ x: ${x.toFixed(3)}, y: ${y.toFixed(3)} }`;
  }
}
