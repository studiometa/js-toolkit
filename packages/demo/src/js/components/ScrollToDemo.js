import { Base } from '@studiometa/js-toolkit';
import { scrollTo } from '@studiometa/js-toolkit/utils';

/**
 *
 */
export default class ScrollToDemo extends Base {
  static config = {
    name: 'ScrollToDemo',
    log: true,
    refs: ['text', 'btn'],
  };

  /**
   *
   */
  mounted() {
    this.$log('mounted');
  }

  /**
   *
   */
  async onBtnClick() {
    this.$log('start scroll');
    await scrollTo(this.$refs.text, { duration: 2, easing: [1, 0, 0, 1] });
    this.$log('end scroll');
  }
}
