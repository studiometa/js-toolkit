import Base from '../abstracts/Base';
import transition from '../utils/css/transition';

/**
 * Tabs class.
 */
export default class Tabs extends Base {
  /**
   * Tabs options.
   */
  get config() {
    return {
      name: 'Tabs',
      styles: {
        content: {
          closed: {
            position: 'absolute',
            opacity: 0,
            pointerEvents: 'none',
            visibility: 'hidden',
          },
        },
      },
    };
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {Tabs} The current instance.
   */
  mounted() {
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
   * @param  {HTMLElement} btn     The tab element.
   * @param  {HTMLElement} content The content element.
   * @return {Tabs}                The Tabs instance.
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
   * @param  {HTMLElement} btn     The tab element.
   * @param  {HTMLElement} content The content element.
   * @return {Tabs}                The Tabs instance.
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
