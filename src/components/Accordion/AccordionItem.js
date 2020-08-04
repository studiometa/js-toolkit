import Base from '../../abstracts/Base';
import * as styles from '../../utils/css/styles';
import transition, { setClassesOrStyles } from '../../utils/css/transition';

/**
 * AccordionItem class.
 */
export default class AccordionItem extends Base {
  /**
   * AccordionItem config
   * @return {Object}
   */
  get config() {
    return {
      name: 'AccordionItem',
      styles: {
        container: {
          open: '',
          active: '',
          closed: '',
        },
      },
    };
  }

  /**
   * Add aria-attributes on mounted.
   * @return {void}
   */
  mounted() {
    this.$refs.btn.setAttribute('id', this.$id);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);
    styles.add(this.$refs.container, { visibility: 'invisible', height: 0 });
  }

  /**
   * Handler for the click event on the `btn` ref.
   * @return {void}
   */
  onBtnClick() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open an item.
   * @return {void}
   */
  async open() {
    if (this.isOpen) {
      return;
    }

    this.$log('open');
    this.$emit('open');

    this.isOpen = true;
    this.$refs.container.setAttribute('aria-hidden', 'false');

    styles.remove(this.$refs.container, { visibility: 'invisible' });
    const { container, ...otherStyles } = this.$options.styles;

    await Promise.all([
      transition(this.$refs.container, {
        from: { height: 0 },
        active: container.active,
        to: { height: `${this.$refs.content.offsetHeight}px` },
      }).then(() => {
        // Do nothing if the item has been closed before the end
        if (!this.isOpen) {
          return Promise.resolve();
        }

        styles.remove(this.$refs.content, { position: 'absolute' });
        return Promise.resolve();
      }),
      ...Object.entries(otherStyles).map(([refName, { open, active, closed } = {}]) =>
        transition(this.$refs[refName], {
          from: closed,
          active,
          to: open,
        }).then(() => {
          // Do nothing if the item has been closed before the end
          if (!this.isOpen) {
            return Promise.resolve();
          }

          setClassesOrStyles(this.$refs[refName], open);
          return Promise.resolve();
        })
      ),
    ]);
  }

  /**
   * Close an item.
   * @return {void}
   */
  async close() {
    if (!this.isOpen) {
      return;
    }

    this.$log('close');
    this.$emit('close');

    this.isOpen = false;

    const height = this.$refs.container.offsetHeight;
    styles.add(this.$refs.content, { position: 'absolute' });
    const { container, ...otherStyles } = this.$options.styles;

    await Promise.all([
      transition(this.$refs.container, {
        from: { height: `${height}px` },
        active: container.active,
        to: { height: 0 },
      }).then(() => {
        // Do nothing if the item has been re-opened before the end
        if (this.isOpen) {
          return Promise.resolve();
        }

        styles.add(this.$refs.container, { height: 0, visibility: 'invisible' });
        this.$refs.container.setAttribute('aria-hidden', 'true');
        return Promise.resolve();
      }),
      ...Object.entries(otherStyles).map(([refName, { open, active, closed } = {}]) =>
        transition(this.$refs[refName], {
          from: open,
          active,
          to: closed,
        }).then(() => {
          // Do nothing if the item has been re-opened before the end
          if (this.isOpen) {
            return Promise.resolve();
          }

          setClassesOrStyles(this.$refs[refName], closed);
          return Promise.resolve();
        })
      ),
    ]);
  }
}
