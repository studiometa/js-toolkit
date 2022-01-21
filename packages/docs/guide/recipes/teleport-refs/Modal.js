import { Base } from '@studiometa/js-toolkit';

/**
 * Modal class.
 */
export default class Modal extends Base {
  static config = {
    name: 'Modal',
    refs: ['open', 'content'],
    options: {
      move: String,
    },
  };

  /**
   * @type {Modal['$refs']}
   */
  orignalRefs;

  /**
   * Get teleported refs.
   * @returns {Base['$refs']}
   */
  get $refs() {
    const $refs = super.$refs;

    // Add original refs to the current refs
    if (this.originalRefs) {
      Object.entries(this.originalRefs).forEach(([name, value]) => {
        if (!$refs[name]) {
          $refs[name] = value;
        }
      });
    }

    return $refs;
  }

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
   * Click handler for the `open` ref.
   * @returns {void}
   */
  onOpenClick() {
    // Implement modal opening logic here.
  }
}
