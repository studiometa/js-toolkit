/* eslint-disable max-classes-per-file */
import { Base } from '../abstracts';

/**
 * AccorionItem class.
 */
class AccordionItem extends Base {
  /**
   * AccordionItem options.
   */
  get config() {
    return {
      name: 'AccordionItem',
      animation: true,
      animationDuration: 300,
    };
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {AccordionItem} The current instance.
   */
  mounted() {
    this.$refs.btn.setAttribute('id', this.$id);
    this.$refs.btn.addEventListener('click', this);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);

    // Animation properties
    this.animationTimeStart = 0;

    // Padding top
    this.animationPaddingTopFrom = 0;
    this.animationPaddingTopTo = 0;

    // Height
    this.animationHeightFrom = 0;
    this.animationHeightTo = 0;

    // Padding bottom
    this.animationPaddingBottomFrom = 0;
    this.animationPaddingBottomTo = 0;

    if (!this.isOpen) {
      this.close(false);
    }

    return this;
  }

  /**
   * Unbind all events on destroy.
   *
   * @return {AccordionItem} The AccordionItem instance.
   */
  destroyed() {
    this.$el.removeEventListener('click', this);

    return this;
  }

  /**
   * Accordion animation renderer.
   */
  ticked({ time }) {
    if (this.animationTimeStart) {
      if (this.$refs.content.style.overflow !== 'hidden') {
        this.$refs.content.style.display = '';
        this.$refs.content.style.overflow = 'hidden';
      }

      if (time <= this.animationTimeStart + this.$options.animationDuration) {
        if (!this.isOpen) {
          /**
           * Percent calcul:
           * -((time - this.animationTimeStart) / this.$options.animationDuration) * this.animationHeightFrom + this.animationHeightFrom
           */
          this.$refs.content.style.paddingTop = `${parseInt(
            -((time - this.animationTimeStart) / this.$options.animationDuration) *
              this.animationPaddingTopFrom +
              this.animationPaddingTopFrom,
            10
          )}px`;

          this.$refs.content.style.height = `${parseInt(
            -((time - this.animationTimeStart) / this.$options.animationDuration) *
              this.animationHeightFrom +
              this.animationHeightFrom,
            10
          )}px`;

          this.$refs.content.style.paddingBottom = `${parseInt(
            -((time - this.animationTimeStart) / this.$options.animationDuration) *
              this.animationPaddingBottomFrom +
              this.animationPaddingBottomFrom,
            10
          )}px`;
        } else {
          /**
           * Percent calcul:
           * this.animationHeightTo * ((time - this.animationTimeStart) / this.$options.animationDuration)
           */
          this.$refs.content.style.paddingTop = `${parseInt(
            this.animationPaddingTopTo *
              ((time - this.animationTimeStart) / this.$options.animationDuration),
            10
          )}px`;

          this.$refs.content.style.height = `${parseInt(
            this.animationHeightTo *
              ((time - this.animationTimeStart) / this.$options.animationDuration),
            10
          )}px`;

          this.$refs.content.style.paddingBottom = `${parseInt(
            this.animationPaddingBottomTo *
              ((time - this.animationTimeStart) / this.$options.animationDuration),
            10
          )}px`;
        }
      } else {
        this.animationTimeStart = 0;

        // Padding top
        this.animationPaddingTopFrom = 0;
        this.animationPaddingTopTo = 0;

        // Height
        this.animationHeightFrom = 0;
        this.animationHeightTo = 0;

        // Padding bottom
        this.animationPaddingBottomFrom = 0;
        this.animationPaddingBottomTo = 0;

        // Styles
        this.$refs.content.style.paddingTop = '';
        this.$refs.content.style.paddingBottom = '';
        this.$refs.content.style.height = '';
        this.$refs.content.style.overflow = '';

        this.onComplete();
      }
    }
  }

  /**
   * AccordionItem is animation complete.
   */
  onComplete() {
    if (this.isOpen) {
      this.$refs.content.style.display = '';
    } else {
      this.$refs.content.style.display = 'none';
    }

    this.$emit('afterAnimation', this);
  }

  /**
   * AccordionItem register event.
   */
  handleEvent(event) {
    try {
      this[`${event.type}Handler`](event);
    } catch (err) {
      console.warn(`The method \`${event.type}Handler\` does not exists.`);
    }
  }

  /**
   * AccordionItem click event.
   */
  clickHandler() {
    this.$log('clickHandler');

    if (this.animationTimeStart) {
      return;
    }

    this.$emit('beforeAnimation', this);

    if (this.isOpen) {
      this.close(this.$options.animation);
    } else {
      this.open(this.$options.animation);
    }
  }

  /**
   * AccordionItem open function.
   *
   * @param {Boolean} animate Open the AccordionItem or not.
   */
  open(animate = true) {
    this.$emit('open', this);

    this.$refs.content.setAttribute('aria-hidden', 'false');
    this.$refs.content.removeAttribute('tabindex');

    if (!animate) {
      this.$refs.content.style.display = '';

      this.$el.classList.remove('is-close');
      this.$el.classList.add('is-open');

      return;
    }

    this.animationPaddingTopFrom =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')
      ) || 0;

    this.animationHeightFrom =
      parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;

    this.animationPaddingBottomFrom =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')
      ) || 0;

    this.$refs.content.style.display = 'block';
    this.$refs.content.style.paddingTop = '';
    this.$refs.content.style.height = '';
    this.$refs.content.style.paddingBottom = '';
    this.$refs.content.style.transition = 'none';
    this.$refs.content.style.animationDuration = '0s';

    this.animationPaddingTopTo =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')
      ) || 0;

    this.animationHeightTo =
      parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;

    this.animationPaddingBottomTo =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')
      ) || 0;

    if (this.animationTimeStart) {
      this.$refs.content.style.display = '';
      this.$refs.content.style.paddingTop = `${this.animationPaddingTopFrom}px`;
      this.$refs.content.style.height = `${this.animationHeightFrom}px`;
      this.$refs.content.style.paddingBottom = `${this.animationPaddingBottomFrom}px`;
    } else {
      this.$refs.content.style.display = 'none';
    }
    this.$refs.content.style.transition = '';
    this.$refs.content.style.animationDuration = '';

    // eslint-disable-next-line no-undef
    this.animationTimeStart = performance.now();
  }

  /**
   * AccordionItem close function.
   *
   * @param {Boolean} animate Close the AccordionItem or not.
   */
  close(animate = true) {
    this.$emit('close', this);

    this.$refs.content.setAttribute('aria-hidden', 'true');
    this.$refs.content.setAttribute('tabindex', '-1');

    if (!animate) {
      this.$refs.content.style.display = 'none';

      this.$el.classList.remove('is-open');
      this.$el.classList.add('is-close');

      return;
    }

    this.animationPaddingTopFrom =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-top')
      ) || 0;

    this.animationHeightFrom =
      parseFloat(window.getComputedStyle(this.$refs.content, null).getPropertyValue('height')) || 0;

    this.animationPaddingBottomFrom =
      parseFloat(
        window.getComputedStyle(this.$refs.content, null).getPropertyValue('padding-bottom')
      ) || 0;

    this.animationPaddingTopTo = 0;
    this.animationHeightTo = 0;
    this.animationPaddingBottomTo = 0;

    // eslint-disable-next-line no-undef
    this.animationTimeStart = performance.now();
  }

  /**
   * AccordionItem is open getter.
   */
  get isOpen() {
    return (
      this.$refs.content.getAttribute('aria-hidden') === 'false' ||
      this.$refs.content.getAttribute('aria-hidden') === null
    );
  }
}

/**
 * Accordion class.
 */
export default class Accordion extends Base {
  /**
   * Accordion options.
   */
  get config() {
    return {
      name: 'Accordion',
      components: {
        AccordionItem,
      },
      itemAutoClose: false,
    };
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {Accordion} The current instance.
   */
  mounted() {
    if (this.$options.itemAutoClose) {
      this.unbindOpen = this.$children.AccordionItem.map((item, index) => {
        return item.$on('open', () => {
          this.openHandler(index);
        });
      });
    }

    return this;
  }

  /**
   * Unbind all events on destroy.
   *
   * @return {Accordion} The Accordion instance.
   */
  destroyed() {
    if (this.unbindOpen) {
      this.unbindOpen.forEach(unbind => unbind());
    }

    return this;
  }

  /**
   * Accordion open event.
   *
   * @param {Integer} index The AccordionItem index.
   */
  openHandler(index = 0) {
    this.$children.AccordionItem.filter((el, i) => index !== i).forEach(item => {
      if (item.isOpen) {
        item.close();
      }
    });
  }
}
