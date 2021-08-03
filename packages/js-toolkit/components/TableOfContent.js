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
 */

/**
 * Create a array of number
 *
 * @param {Number} total Array size.
 *
 * @returns {Array}
 */
function createArrayOfNumber(total = 10) {
  return [...new Array(total)].map((val, index) => index / total);
}

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

  visibleSections = [];

  bestActiveKey;

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

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.addVisibleSection(id, entry.intersectionRatio);
          } else {
            this.removeVisibleSection(id);
          }
        },
        { threshold: createArrayOfNumber(100) }
      );

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
   * Add a section into the visibleSection array.
   * @param {String} key   id of the section.
   * @param {Number} ratio visibility ratio of the section.
   *
   * @return {void}
   */
  addVisibleSection(key, ratio) {
    this.visibleSections[key] = ratio;
    this.updateVisibleSection();
  }

  /**
   * Remove a section into the visibleSection array.
   * @param {String} key id of the section.
   *
   * @return {void}
   */
  removeVisibleSection(key) {
    delete this.visibleSections[key];
    this.updateVisibleSection();
  }

  /**
   * Sort and return the visibleSection array.
   *
   * @return {Object}
   */
  get sortVisibleSection() {
    return Object.entries(this.visibleSections).sort((a, b) => {
      if (a[1] < b[1]) {
        return -1;
      }

      if (a[1] > b[1]) {
        return 1;
      }

      return 0;
    });
  }

  /**
   * Get the better active section key.
   *
   * @return {void}
   */
  updateVisibleSection() {
    if (this.sortVisibleSection.length === 0) {
      return;
    }
    const [key] = this.sortVisibleSection.pop() || [];
    if (key !== this.bestActiveKey) {
      this.changeActiveSection(key);
    }
  }

  /**
   * Update the anchor relative to the visible section.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @param {String} id of the section.
   *
   * @return {void}
   */
  changeActiveSection(id) {
    const oldActiveAnchor = this.$refs.anchors.find((a) =>
      a.parentElement.classList.contains(this.$options.activeClass)
    );
    const activeAnchor = this.$refs.anchors.find((a) => a.getAttribute('href') === `#${id}`);

    if (oldActiveAnchor) {
      oldActiveAnchor.parentElement.classList.remove(this.$options.activeClass);
    }

    if (activeAnchor) {
      activeAnchor.parentElement.classList.add(this.$options.activeClass);
    }
  }

  /**
   * Scroll to the section.
   *
   * @this {TableOfContent & TableOfContentInterface}
   *
   * @param {String} id of the target section.
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
