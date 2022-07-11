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
    components: {
      Child,
    },
  };

  onChildClick(...args) {
    console.log(this.$id, 'onChildClick', ...args);
  }

  onChildDede(...args) {
    console.log(this.$id, 'onChildDede', ...args);
  }
}
