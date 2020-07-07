import Base from '../abstracts/Base';
import setClasses from '../utils/setClasses';
import setStyles from '../utils/setStyles';

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
    setClasses(btn, this.$options.tabActiveClass);
    setStyles(btn, this.$options.tabActiveStyle);
    setClasses(content, this.$options.contentActiveClass);
    setStyles(content, this.$options.contentActiveStyle);

    setClasses(btn, this.$options.tabInactiveClass, 'remove');
    setStyles(btn, this.$options.tabInactiveStyle, 'remove');
    setClasses(content, this.$options.contentInactiveClass, 'remove');
    setStyles(content, this.$options.contentInactiveStyle, 'remove');

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
    setClasses(btn, this.$options.tabActiveClass, 'remove');
    setStyles(btn, this.$options.tabActiveStyle, 'remove');
    setClasses(content, this.$options.contentActiveClass, 'remove');
    setStyles(content, this.$options.contentActiveStyle, 'remove');

    setClasses(btn, this.$options.tabInactiveClass);
    setStyles(btn, this.$options.tabInactiveStyle);
    setClasses(content, this.$options.contentInactiveClass);
    setStyles(content, this.$options.contentInactiveStyle);

    content.setAttribute('aria-hidden', 'true');
    this.$emit('disable', { btn, content });

    return this;
  }
}
