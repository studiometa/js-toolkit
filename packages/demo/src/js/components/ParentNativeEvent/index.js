import { Base } from '@studiometa/js-toolkit';
import Child from './Child.js';

/**
 * ParentNativeEvent class.
 */
export default class ParentNativeEvent extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'ParentNativeEvent',
    log: true,
    components: {
      Child,
    },
  };

  onChildClick(...args) {
    this.$log(this.$id, 'onChildClick', ...args);
  }

  onChildDede(...args) {
    this.$log(this.$id, 'onChildDede', ...args);
  }
}
