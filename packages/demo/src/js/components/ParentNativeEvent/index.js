import { Base } from '@studiometa/js-toolkit';
import { createElement } from '@studiometa/js-toolkit/utils';
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
    debug: false,
    components: {
      Child,
    },
  };

  updated() {
    this.$log(this.$children.Child);
  }

  onDocumentClick({ event }) {
    if (event.metaKey) {
      this.$el.firstElementChild.remove();
    } else if (event.altKey) {
      this.$children.Child[0].$el.dataset.component = '';
    } else {
      this.$el.append(
        createElement('button', {
          dataComponent: 'Child',
        }),
      );
    }
  }
}
