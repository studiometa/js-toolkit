import deepmerge from 'deepmerge';
import Base from '../../abstracts/Base/index.js';
import Accordion from './Accordion.js';
import * as styles from '../../utils/css/styles.js';
import transition from '../../utils/css/transition.js';

/**
 * @typedef {import('../../abstracts/Base').BaseOptions} BaseOptions
 * @typedef {import('../../utils/css/styles.js').CssStyleObject} CssStyleObject
 * @typedef {import('./Accordion.js').AccordionInterface} AccordionInterface
 */

/**
 * @typedef {Object} AccordionItemRefs
 * @property {HTMLElement} btn
 * @property {HTMLElement} content
 * @property {HTMLElement} container
 */

/**
 * @typedef {Object} StylesOption
 * @property {String|CssStyleObject} open
 * @property {String|CssStyleObject} active
 * @property {String|CssStyleObject} closed
 */

/**
 * @typedef {Object} AccordionItemOptions
 * @property {Boolean} isOpen
 * @property {{ [refName: string]: StylesOption }} styles
 */

/**
 * @typedef {Object} AccordionItemInterface
 * @property {AccordionItemOptions} $options
 * @property {AccordionItemRefs} $refs
 * @property {Accordion & AccordionInterface} $parent
 */

/**
 * AccordionItem class.
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
   * @this {AccordionItem & AccordionItemInterface}
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
    /** @type {AccordionItemRefs} */
    const refs = this.$refs;
    Object.entries(otherStyles)
      .filter(([refName]) => refs[refName])
      .forEach(([refName, { open, closed } = { open: '', closed: '' }]) => {
        transition(refs[refName], { to: isOpen ? open : closed }, 'keep');
      });
  }

  /**
   * Remove styles on destroy.
   * @this {AccordionItem & AccordionItemInterface}
   */
  destroyed() {
    styles.remove(this.$refs.container, { visibility: '', height: '' });
  }

  /**
   * Handler for the click event on the `btn` ref.
   * @this {AccordionItem & AccordionItemInterface}
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
   * @this {AccordionItem & AccordionItemInterface}
   * @param  {Boolean} isOpen The state of the item.
   */
  updateAttributes(isOpen) {
    this.$refs.content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    this.$refs.btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  /**
   * Open an item.
   * @this {AccordionItem & AccordionItemInterface}
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

    /** @type {AccordionItemRefs} */
    const refs = this.$refs;

    await Promise.all([
      transition(refs.container, {
        from: { height: 0 },
        active: container.active,
        to: { height: `${refs.content.offsetHeight}px` },
      }).then(() => {
        // Remove style only if the item has not been closed before the end
        if (this.$options.isOpen) {
          styles.remove(refs.content, { position: 'absolute' });
        }

        return Promise.resolve();
      }),
      ...Object.entries(otherStyles)
        .filter(([refName]) => refs[refName])
        .map(([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            refs[refName],
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
   * @this {AccordionItem & AccordionItemInterface}
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

    /** @type {AccordionItemRefs} */
    const refs = this.$refs;

    await Promise.all([
      transition(refs.container, {
        from: { height: `${height}px` },
        active: container.active,
        to: { height: '0' },
      }).then(() => {
        // Add end styles only if the item has not been re-opened before the end
        if (!this.$options.isOpen) {
          styles.add(refs.container, { height: '0', visibility: 'invisible' });
          this.updateAttributes(this.$options.isOpen);
        }
        return Promise.resolve();
      }),
      ...Object.entries(otherStyles)
        .filter(([refName]) => refs[refName])
        .map(([refName, { open, active, closed } = { open: '', active: '', closed: '' }]) =>
          transition(
            refs[refName],
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
