import Base from '../abstracts/Base';
import transition from '../utils/css/transition';

/**
 * @typedef {import('../abstracts/Base').BaseOptions} BaseOptions
 */

/**
 * @typedef {Object} TabItem
 * @property {HTMLElement} btn
 * @property {HTMLElement} content
 * @property {Boolean} isEnabled
 */

/**
 * Tabs class.
 * @property {BaseOptions & { styles: Object }} $options
 */
export default class Tabs extends Base {
  /**
   * Tabs config.
   */
  static config = {
    name: 'Tabs',
    refs: ['btn[]', 'content[]'],
    options: {
      styles: {
        type: Object,
        default: () => ({
          content: {
            closed: {
              position: 'absolute',
              opacity: '0',
              pointerEvents: 'none',
              visibility: 'hidden',
            },
          },
        }),
      },
    },
  };

  /**
   * Tabs items.
   * @type {Array<TabItem>}
   */
  items;

  /**
   * Initialize the component's behaviours.
   */
  mounted() {
    // @ts-ignore
    this.items = this.$refs.btn.map((btn, index) => {
      const id = `${this.$id}-${index}`;
      const content = this.$refs.content[index];
      btn.setAttribute('id', id);
      content.setAttribute('aria-labelledby', id);

      const item = { btn, content, isEnabled: index > 0 };
      if (index > 0) {
        this.disableItem(item);
      } else {
        this.enableItem(item);
      }
      return item;
    });

    return this;
  }

  /**
   * Switch tab on button click.
   *
   * @param  {Event}  event The click event object.
   * @param  {Number} index The index of the clicked button.
   * @return {void}
   */
  onBtnClick(event, index) {
    this.items.forEach((item, i) => {
      if (i !== index) {
        this.disableItem(item);
      }
    });

    this.enableItem(this.items[index]);
  }

  /**
   * Enable the given tab and its associated content.
   *
   * @param  {TabItem}       item The item to enable.
   * @return {Promise<Tabs>}      Tabs instance.
   */
  async enableItem(item) {
    if (!item || item.isEnabled) {
      return Promise.resolve(this);
    }

    item.isEnabled = true;
    const { btn, content } = item;
    const btnStyles = this.$options.styles.btn || {};
    const contentStyles = this.$options.styles.content || {};

    content.setAttribute('aria-hidden', 'false');
    this.$emit('enable', item);

    return Promise.all([
      transition(
        btn,
        {
          from: btnStyles.closed,
          active: btnStyles.active,
          to: btnStyles.open,
        },
        'keep'
      ),
      transition(
        content,
        {
          from: contentStyles.closed,
          active: contentStyles.active,
          to: contentStyles.open,
        },
        'keep'
      ),
    ]).then(() => Promise.resolve(this));
  }

  /**
   * Disable the given tab and its associated content.
   *
   * @param  {TabItem}       item The item to disable.
   * @return {Promise<Tabs>}      The Tabs instance.
   */
  async disableItem(item) {
    if (!item || !item.isEnabled) {
      return Promise.resolve(this);
    }

    item.isEnabled = false;
    const { btn, content } = item;
    const btnStyles = this.$options.styles.btn || {};
    const contentStyles = this.$options.styles.content || {};

    content.setAttribute('aria-hidden', 'true');
    this.$emit('disable', item);

    return Promise.all([
      transition(
        btn,
        {
          from: btnStyles.open,
          active: btnStyles.active,
          to: btnStyles.closed,
        },
        'keep'
      ),
      transition(
        content,
        {
          from: contentStyles.open,
          active: contentStyles.active,
          to: contentStyles.closed,
        },
        'keep'
      ),
    ]).then(() => Promise.resolve(this));
  }
}
