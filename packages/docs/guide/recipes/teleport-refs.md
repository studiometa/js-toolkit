# Teleport refs

If a component teleports refs outside of its scope, these refs will not be found anymore and will not be accessible by using `this.$refs.<refName>`.

We can make sure that the moved refs are still accessible by saving the original ones before teleporting them and overwriting the `$refs` getter in the component.

### Modal component example

```js
import { Base } from '@studiometa/js-toolkit';

/**
 * Modal class.
 */
export default class Modal extends Base {
  static config = {
    name: 'Modal',
    refs: ['content'],
    options: {
      move: String,
    },
  };

  /**
   * @type {Modal['$refs']}
   */
  orignalRefs;

  /**
   * Mounted hook.
   * @returns {void}
   */
  mounted() {
    if (this.$options.move) {
      const target = document.querySelector(this.$options.move);

      if (target) {
        this.originalRefs = this.$refs;
        target.appendChild(this.$refs.content);
      }
    }
  }

  /**
   * Get teleported refs.
   * @returns {Base['$refs']}
   */
  get $refs() {
    const $refs = super.$refs;

    // Add original refs to
    if (this.originalRefs) {
      Object.entries(this.originalRefs).forEach(([name, value]) => {
        if (!$refs[name]) {
          $refs[name] = value;
        }
      });
    }

    return $refs;
  }
}
```
