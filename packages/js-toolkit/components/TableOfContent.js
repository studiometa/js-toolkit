import Base from '../abstracts/Base/index.js';

/**
 * Anchor component
 */
export default class TableOfContent extends Base {
  /**
   * Class config
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
   * Initilize the component
   *
   * @return {void}
   */
  mounted() {
    this.sections = this.$el.parentElement.querySelectorAll('.js-section');
    this.ul = document.createElement('ul');
    this.createNavItems();
  }

  /**
   * Create nav items
   *
   * @return {void}
   */
  createNavItems() {
    (this.sections ?? []).forEach((section, i) => {
      const title = section.querySelector('h2')?.textContent ?? `Section ${i}`;
      const a = document.createElement('a');
      const li = document.createElement('li');
      const id = section.id ?? `section-${i}`;

      li.classList.add('table-of-content__nav-item');

      a.classList.add('table-of-content__nav-link');
      a.href = `#${id}`;
      a.dataset.ref = 'anchors[]';
      a.textContent = title;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          li.classList.add(this.$options.activeClass);
        } else {
          li.classList.remove(this.$options.activeClass);
        }
      });

      observer.observe(section);

      a.addEventListener('click', this.scrollTo);

      li.appendChild(a);
      this.ul.appendChild(li);
    });

    this.$refs.nav.appendChild(this.ul);
  }

  /**
   * Scroll to the section
   *
   * @param {Event} event The click event object.
   */
  scrollTo(event) {
    event.preventDefault();
    this.sections.forEach((section) => {
      const id = event.currentTarget.getAttribute('href').replace(/^#/, '');
      if (section.id !== id) {
        return;
      }

      window.scroll(0, section.offsetTop);
    });
  }
}
