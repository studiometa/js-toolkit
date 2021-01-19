import deepmerge from 'deepmerge'
import Base from '../../abstracts/Base';
import Accordion from './index';
import * as styles from '../../utils/css/styles';
import transition from '../../utils/css/transition';

/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../utils/css/styles').CssStyleObject} CssStyleObject
 * @typedef {{ open: string | CssStyleObject, active: string | CssStyleObject, closed: string | CssStyleObject }} StylesOption
 */

/**
 * AccordionItem class.
 * @property {BaseOptions & { styles: { container: StylesOption, [refName:string]: StylesOption}, isOpen: Boolean }} $options
 */
export default class AccordionItem extends Base {
  /**
   * AccordionItem config
   * @return {Object}
   */
  static config = {
    name: 'AccordionItem',
    refs: ['btn', 'content', 'container'],
    options: {
      isOpen: Boolean,
      styles: {
        type: Object,
        default: () => ({
          container: {
            open: '',
            active: '',
            closed: '',
          },
        }),
      },
    },
  };

  /**
   * Add aria-attributes on mounted.
   * @return {void}
   */
  mounted() {
    if (this.$parent && this.$parent instanceof Accordion && this.$parent.$options.item) {
      Object.entries(this.$parent.$options.item).forEach(([key, value]) => {
        if (key in this.$options) {
          const type = AccordionItem.config.options[key].type || AccordionItem.config.options[key];
          if (type === Array || type === Object) {
            this.$options[key] = deepmerge(this.$options[key], value);
          } else {
            this.$options[key] = value;
          }
        }
      });
    }

    this.$refs.btn.setAttribute('id', this.$id);
    this.$refs.btn.setAttribute('aria-controls', this.contentId);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);
    this.$refs.content.setAttribute('id', this.contentId);

    const { isOpen } = this.$options;
    this.updateAttributes(isOpen);

    if (!isOpen) {
      styles.add(this.$refs.container, { visibility: 'invisible', height: '0' });
    }

    // Update refs styles on mount
    const { container, ...otherStyles } = this.$options.styles;
    Object.entries(otherStyles)
      .filter(([refName]) => this.$refs[refName])
      .forEach(([refName, { open, closed } = { open: '', closed: '' }]) => {
        transition(this.$refs[refName], { to: isOpen ? open : closed }, 'keep');
      });
  }

  /**
   * Handler for the click event on the `btn` ref.
   * @return {void}
   */
  onBtnClick() {
    if (this.$options.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Get the content ID.
   * @return {String}
   */
  get contentId() {
    return `content-${this.$id}`;
  }

  /**
   * Update the refs' attributes according to the given type.
   *
   * @param  {Boolean} isOpen The state of the item.
   * @return {void}
   */
  updateAttributes(isOpen) {
    this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  /**
   * Open an item.
   * @return {Promise}
   */
  async open() {
    if (this.$options.isOpen) {
      return;
    }

    this.$log('open');
    this.$emit('open');

    this.$options.isOpen = true;
    this.updateAttributes(this.$options.isOpen);

    styles.remove(this.$refs.container, { visibility: 'invisible' });
    const { container, ...otherStyles } = this.$options.styles;

    await Promise.all([
      transition(this.$refs.container, {
        from: { height: 0 },
        active: container.active,
        to: { height: `${this.$refs.content.offsetHeight}px` },
      }).then(() => {
        // Remove style only if the item has not been closed before the end
        if (this.$options.isOpen) {
          styles.remove(this.$refs.content, { position: 'absolute' });
        }

        return Promise.resolve();
      }),
      ...Object.entries(otherStyles)
        .filter(([refName]) => this.$refs[refName])
        .map(([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            this.$refs[refName],
            {
              from: closed,
              active,
              to: open,
            },
            'keep'
          )
        ),
    ]);
  }

  /**
   * Close an item.
   * @return {Promise}
   */
  async close() {
    if (!this.$options.isOpen) {
      return;
    }

    this.$log('close');
    this.$emit('close');

    this.$options.isOpen = false;

    const height = this.$refs.container.offsetHeight;
    styles.add(this.$refs.content, { position: 'absolute' });
    const { container, ...otherStyles } = this.$options.styles;

    await Promise.all([
      transition(this.$refs.container, {
        from: { height: `${height}px` },
        active: container.active,
        to: { height: '0' },
      }).then(() => {
        // Add end styles only if the item has not been re-opened before the end
        if (!this.$options.isOpen) {
          styles.add(this.$refs.container, { height: '0', visibility: 'invisible' });
          this.updateAttributes(this.$options.isOpen);
        }
        return Promise.resolve();
      }),
      ...Object.entries(otherStyles)
        .filter(([refName]) => this.$refs[refName])
        .map(([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            this.$refs[refName],
            {
              from: open,
              active,
              to: closed,
            },
            'keep'
          )
        ),
    ]);
  }
}
