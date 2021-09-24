import Base from '@studiometa/js-toolkit';
import scrollTo from '@studiometa/js-toolkit/utils/scrollTo';

export default class ScrollToDemo extends Base {
  static config = {
    name: 'ScrollToDemo',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }

  async onBtnClick() {
    this.$log('click on btn ref');
    scrollTo(this.$refs.text);
  }
}
