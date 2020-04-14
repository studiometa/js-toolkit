/* eslint-disable max-classes-per-file */
import { Base } from '../../../src';

class AccordionItem extends Base {
  get config() {
    return {
      name: 'AccordionItem',
    };
  }

  mounted() {
    this.$refs.button.setAttribute('id', this.$id);
    this.$refs.button.addEventListener('click', this);
    this.$refs.content.setAttribute('aria-labelledby', this.$id);

    // Animation properties
    this.time = 0;
    this.animationDuration = parseInt(this.$el.dataset.optionsAnimationDuration, 10) || 500;
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
  }

  destroyed() {
    this.$el.removeEventListener('click', this);
  }

  ticked() {
    // eslint-disable-next-line no-undef
    this.time = performance.now();

    if (this.animationTimeStart) {
      if (this.$refs.content.style.overflow !== 'hidden') {
        this.$refs.content.style.display = '';
        this.$refs.content.style.overflow = 'hidden';
      }

      if (this.time <= this.animationTimeStart + this.animationDuration) {
        if (!this.isOpen) {
          /**
           * Percent calcul:
           * -((this.time - this.animationTimeStart) / this.animationDuration) * this.animationHeightFrom + this.animationHeightFrom
           */
          this.$refs.content.style.paddingTop = `${parseInt(
            -((this.time - this.animationTimeStart) / this.animationDuration) *
              this.animationPaddingTopFrom +
              this.animationPaddingTopFrom,
            10
          )}px`;

          this.$refs.content.style.height = `${parseInt(
            -((this.time - this.animationTimeStart) / this.animationDuration) *
              this.animationHeightFrom +
              this.animationHeightFrom,
            10
          )}px`;

          this.$refs.content.style.paddingBottom = `${parseInt(
            -((this.time - this.animationTimeStart) / this.animationDuration) *
              this.animationPaddingBottomFrom +
              this.animationPaddingBottomFrom,
            10
          )}px`;
        } else {
          /**
           * Percent calcul:
           * this.animationHeightTo * ((this.time - this.animationTimeStart) / this.animationDuration)
           */
          this.$refs.content.style.paddingTop = `${parseInt(
            this.animationPaddingTopTo *
              ((this.time - this.animationTimeStart) / this.animationDuration),
            10
          )}px`;

          this.$refs.content.style.height = `${parseInt(
            this.animationHeightTo *
              ((this.time - this.animationTimeStart) / this.animationDuration),
            10
          )}px`;

          this.$refs.content.style.paddingBottom = `${parseInt(
            this.animationPaddingBottomTo *
              ((this.time - this.animationTimeStart) / this.animationDuration),
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

  onComplete() {
    if (this.isOpen) {
      this.$refs.content.style.display = '';
    } else {
      this.$refs.content.style.display = 'none';
    }
  }

  handleEvent(event) {
    try {
      this[`${event.type}Handler`](event);
    } catch (err) {
      console.warn(`The method \`${event.type}Handler\` does not exists.`);
    }
  }

  clickHandler() {
    this.$log('clickHandler');

    if (this.animationTimeStart) {
      return;
    }

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(isAnimated = true) {
    this.$emit('open');

    this.$refs.content.setAttribute('aria-hidden', 'false');
    this.$refs.content.removeAttribute('tabindex');

    if (!isAnimated) {
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

    this.animationTimeStart = this.time;
  }

  close(isAnimated = true) {
    this.$emit('close');
    this.$refs.content.setAttribute('aria-hidden', 'true');
    this.$refs.content.setAttribute('tabindex', '0');

    if (!isAnimated) {
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

    this.animationTimeStart = this.time;
  }

  get isOpen() {
    return (
      this.$refs.content.getAttribute('aria-hidden') === 'false' ||
      this.$refs.content.getAttribute('aria-hidden') === null
    );
  }
}

export default class Accordion extends Base {
  get config() {
    return {
      name: 'Accordion',
      components: {
        AccordionItem,
      },
    };
  }

  mounted() {
    if (typeof this.$el.dataset.optionsItemAutoClose === 'undefined') {
      return;
    }

    this.unbindOpen = this.$children.AccordionItem.map((item, index) => {
      return item.$on('open', () => {
        this.openHandler(index);
      });
    });
  }

  destroyed() {
    this.unbindOpen.forEach(unbind => unbind());
  }

  openHandler(index) {
    this.$children.AccordionItem.filter((el, i) => index !== i).forEach(item => {
      if (item.isOpen) {
        item.close();
      }
    });
  }
}
