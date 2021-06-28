import Base from '../abstracts/Base/index.js';

/**
 * @typedef {Object} TableOfContentRefs
 * @property {HTMLElement} nav
 * @property {HTMLElement[]} anchors
 */

/**
 * @typedef {Object} TableOfContentOptions
 * @property {String} activeClass Class when the anchor is active.
 */

/**
 * @typedef {Object} TableOfContentInterface
 * @property {TableOfContentRefs} $refs
 * @property {TableOfContentOptions} $options

/**
 * Anchor component.
 */
export default class TableOfContent extends Base {
  /**
   * Class config.
   */
  static config = {
    name: 'TableOfContent',
    refs: ['nav', 'anchors[]'],
    options: {
      activeClass: {
        type: String,
        default: 'is-active',
      },
    },
  };

  /**
   * Initilize the component.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @return {void}
   */
  mounted() {
    this.unbindMethods = [];
    /** @type {HTMLElement[]} */
    this.sections = Array.from(this.$el.parentElement.querySelectorAll('.js-section'));
    this.ul = document.createElement('ul');
    this.createNavItems();
  }

  unbindMethods = [];

  /**
   * Create nav items.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @return {void}
   */
  createNavItems() {
    (this.sections ?? []).forEach((section, i) => {
      const title = section.querySelector('h2')?.textContent ?? `Section ${i}`;
      const anchor = document.createElement('a');
      const li = document.createElement('li');
      const id = section.id ?? `section-${i}`;

      li.classList.add('table-of-content__nav-item');

      anchor.classList.add('table-of-content__nav-link');
      anchor.href = `#${id}`;
      anchor.dataset.ref = 'anchors[]';
      anchor.textContent = title;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          li.classList.add(this.$options.activeClass);
        } else {
          li.classList.remove(this.$options.activeClass);
        }
      });

      observer.observe(section);

      /** @param {MouseEvent} e */
      const handler = (e) => {
        e.preventDefault();
        this.scrollTo(id);
      };
      anchor.addEventListener('click', handler);
      this.unbindMethods.push(() => {
        anchor.removeEventListener('click', handler);
      });

      li.appendChild(anchor);
      this.ul.appendChild(li);
    });

    this.$refs.nav.appendChild(this.ul);
  }

  /**
   * Scroll to the section.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @param {string} id of the target section.
   *
   * @return {void}
   */
  scrollTo(id) {
    const section = this.sections.find((s) => s.id === id);

    if (section) {
      window.scroll(0, section.offsetTop);
    }
  }

  /**
   * Destroyed.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @return {void}
   */
  destroyed() {
    this.unbindMethods.forEach((method) => {
      if (typeof method === 'function') {
        method();
      }
    });
  }
}
