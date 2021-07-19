import Base from '../abstracts/Base/index.js';

/**
 * @typedef {Object} TableOfContentRefs
 * @property {HTMLElement} nav
 * @property {HTMLElement[]} anchors
 * @property {HTMLElement[]} sections
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
    refs: ['nav', 'anchors[]', 'sections[]'],
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
    const ulElement = document.createElement('ul');
    (this.$refs.sections ?? []).forEach((section, i) => {
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
      ulElement.appendChild(li);
    });

    this.$refs.nav.appendChild(ulElement);
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
    const section = this.$refs.sections.find((s) => s.id === id);
    const scrollY =
      (window.pageYOffset || document.documentElement.scrollTop) +
      section.getBoundingClientRect().top;

    if (section) {
      window.scroll(0, scrollY);
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
