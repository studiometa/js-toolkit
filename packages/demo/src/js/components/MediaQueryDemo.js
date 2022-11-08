import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';

export default class MediaQueryDemo extends withMountOnMediaQuery(
  Base,
  'not (prefers-reduced-motion)',
) {
  static config = {
    name: 'MediaQueryDemo',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }

  destroyed() {
    this.$log('destroyed');
  }
}
