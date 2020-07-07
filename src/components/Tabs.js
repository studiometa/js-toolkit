import Base from '../abstracts/Base';
import * as classes from '../utils/css/classes';
import * as styles from '../utils/css/styles';

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
      tabActiveClass: '',
      tabActiveStyle: {},
      tabInactiveClass: '',
      tabInactiveStyle: {},
      contentActiveClass: '',
      contentActiveStyle: {},
      contentInactiveClass: '',
      contentInactiveStyle: {
        display: 'none',
      },
    };
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {Tabs} The current instance.
   */
  mounted() {
    this.$refs.btn.forEach((btn, index) => {
      const id = `${this.$id}-${index}`;
      const content = this.$refs.content[index];
      btn.setAttribute('id', id);
      content.setAttribute('aria-labelledby', id);

      if (index === 0) {
        this.enableTab(btn, content);
      } else {
        this.disableTab(btn, content);
      }
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
    this.$refs.btn
      .filter((el, i) => i !== index)
      .forEach((el, i) => {
        this.disableTab(el, this.$refs.content[i]);
      });

    this.enableTab(this.$refs.btn[index], this.$refs.content[index]);
  }

  /**
   * Enable the given tab and its associated content.
   *
   * @param  {HTMLElement} btn     The tab element.
   * @param  {HTMLElement} content The content element.
   * @return {Tabs}                The Tabs instance.
   */
  enableTab(btn, content) {
    classes.add(btn, this.$options.tabActiveClass);
    styles.add(btn, this.$options.tabActiveStyle);
    classes.add(content, this.$options.contentActiveClass);
    styles.add(content, this.$options.contentActiveStyle);

    classes.remove(btn, this.$options.tabInactiveClass);
    styles.remove(btn, this.$options.tabInactiveStyle);
    classes.remove(content, this.$options.contentInactiveClass);
    styles.remove(content, this.$options.contentInactiveStyle);

    content.setAttribute('aria-hidden', 'false');
    this.$emit('enable', { btn, content });

    return this;
  }

  /**
   * Disable the given tab and its associated content.
   *
   * @param  {HTMLElement} btn     The tab element.
   * @param  {HTMLElement} content The content element.
   * @return {Tabs}                The Tabs instance.
   */
  disableTab(btn, content) {
    classes.remove(btn, this.$options.tabActiveClass);
    styles.remove(btn, this.$options.tabActiveStyle);
    classes.remove(content, this.$options.contentActiveClass);
    styles.remove(content, this.$options.contentActiveStyle);

    classes.add(btn, this.$options.tabInactiveClass);
    styles.add(btn, this.$options.tabInactiveStyle);
    classes.add(content, this.$options.contentInactiveClass);
    styles.add(content, this.$options.contentInactiveStyle);

    content.setAttribute('aria-hidden', 'true');
    this.$emit('disable', { btn, content });

    return this;
  }
}
