import { Base } from '../abstracts';
import { isObject } from '../utils';

/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @param {String}      method     The method to use: add, remove or toggle.
 */
function setClasses(element, classNames, method = 'add') {
  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(className => {
    element.classList[method](className);
  });
}

/**
 * Manage a list of style properties on an element.
 *
 * @param {HTMLElement}         element The element to update.
 * @param {CSSStyleDeclaration} styles  An object of styles properties and values.
 * @param {String}              method  The method to use: add or remove.
 */
function setStyles(element, styles, method = 'add') {
  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(([prop, value]) => {
    element.style[prop] = method === 'add' ? value : '';
  });
}

/**
 * Tabs class.
 */
export default class Tabs extends Base {
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

  mounted() {
    this.items = this.$refs.btn.map((btn, index) => {
      const id = `${this.$id}-${index}`;
      const content = this.$refs.content[index];
      btn.setAttribute('id', id);
      content.setAttribute('aria-labelledby', id);

      if (index === 0) {
        this.enableTab(btn, content);
      } else {
        this.disableTab(btn, content);
      }

      const clickHandler = () => {
        this.$refs.btn.forEach((el, i) => {
          this.disableTab(el, this.$refs.content[i]);
        });

        this.enableTab(btn, content);
      };

      btn.addEventListener('click', clickHandler);
      return {
        btn,
        clickHandler,
      };
    });
  }

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
  }

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
  }

  destroyed() {
    this.items.forEach(({ btn, clickHandler }) => {
      btn.removeEventListener('click', clickHandler);
    });
  }
}
