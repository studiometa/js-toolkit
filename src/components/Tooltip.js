import Base from '../abstracts/Base';
import * as styles from '../utils/css/styles';
import transition from '../utils/css/transition';

/**
 * Find the best position for an element to be displayed.
 *
 * @param  {HTMLElement} element Element to search best position.
 * @param  {Number}      offset  Offset to keep from window
 *
 * @return {Object} X, Y positions
 */
function findBestPosition(element, offset) {
  const contentSizes = element.getBoundingClientRect();
  const isOverflowingTop = contentSizes.top < offset;
  const isOverflowingRight = contentSizes.right > window.innerWidth - offset;
  const isOverflowingLeft = contentSizes.left < offset;

  let x = null;
  const y = isOverflowingTop ? 'bottom' : 'top';

  if (isOverflowingLeft) {
    x = Math.abs(contentSizes.left) + offset;
  }

  if (isOverflowingRight) {
    x = window.innerWidth - offset - Math.abs(contentSizes.right);
  }

  return {
    x,
    y,
  };
}

/**
 * Tooltip class.
 */
export default class Tooltip extends Base {
  /**
   * Tooltip options.
   */
  get config() {
    return {
      name: 'Tooltip',
      offset: 0,
      isOpen: false,
      styles: {
        container: {
          closed: {
            opacity: 0,
            pointerEvents: 'none',
          },
          top: {
            bottom: '100%',
            left: '50%',
          },
          bottom: {
            top: '100%',
            bottom: 'auto',
            left: '50%',
          }
        },
        content: {
          top: {
            top: 'auto',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
          },
          bottom: {
            top: 0,
            bottom: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
          }
        },
      },
    };
  }

  /**
   * Switch tooltip on trigger focus.
   *
   * @return {Function}
   */
  get onTriggerFocus() {
    return this.open;
  }

  /**
   * Switch tooltip on trigger blur.
   *
   * @return {Function}
   */
  get onTriggerBlur() {
    return this.close;
  }

  /**
   * Switch tooltip on mouseenter.
   *
   * @return {Function}
   */
  get onMouseenter() {
    return this.open;
  }

  /**
   * Switch tooltip on mouseleave.
   *
   * @return {Function}
   */
  get onMouseleave() {
    return this.close;
  }

  /**
   * Initialize the component's behaviours.
   *
   * @return {Tooltip} The current instance.
   */
  async mounted() {
    const { container, content, trigger } = this.$refs;

    content.setAttribute('aria-labelledby', this.$id);
    trigger.setAttribute('id', this.$id);

    await this.close();

    if (this.$options.isOpen) {
      await this.open();
    }

    return this;
  }

  /**
   * Unbind all events on destroy.
   *
   * @return {Tooltip} The Tooltip instance.
   */
  async destroyed() {
    await this.close();

    return this;
  }

  /**
   * Close the tooltip on `ESC`.
   *
   * @param  {Boolean}       options.isUp   Is it a keyup event?
   * @param  {Boolean}       options.ESC    Is it the ESC key?
   * @return {void}
   */
  async keyed({ isUp, ESC }) {
    if (!this.isOpen) {
      return;
    }

    if (ESC && isUp) {
      await this.close();
    }
  }

  /**
   * Set the position of the tooltip
   *
   * @return {void}
   */
  async setPosition(position) {
    const allowed = ['top', 'bottom'];

    if (!allowed.includes(position)) {
      const list = allowed.map(pos => `- ${pos}`).join('\n');
      throw new Error(
        `"${position}" is not an authorized position. Choose one in the list below:\n\n${list}\n`
      );
    }

    return Promise.all(
      Object.entries(this.$options.styles).map(([refName, value = {}]) => {
        if (!value[position]) {
          return Promise.resolve(this);
        }

        return transition(
          this.$refs[refName],
          {
            from: value[this.position],
            to: value[position],
          },
          'keep'
        );
      })
    ).then(() => {
      this.position = position;
      return Promise.resolve(this);
    });
  }

  /**
   * Open the tooltip.
   *
   * @return {Tooltip} The Tooltip instance.
   */
  async open() {
    if (this.isOpen) {
      return Promise.resolve(this);
    }

    this.$refs.container.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    this.$emit('open');

    const { x, y: position } = findBestPosition(this.$refs.content, this.$options.offset);

    if (x !== null) {
      styles.add(
        this.$refs.content,
        {
          marginLeft: `${x}px`,
        }
      );
    }

    await this.setPosition(position);

    return Promise.all(
      Object.entries(this.$options.styles).map(([refName, { open, active, closed } = {}]) =>
        transition(
          this.$refs[refName],
          {
            from: closed,
            active,
            to: open,
          },
          'keep'
        )
      )
    ).then(() => Promise.resolve(this));
  }

  /**
   * Close the tooltip.
   *
   * @return {Tooltip} The Tooltip instance.
   */
  async close() {
    if (this.isOpen === false || (this.isOpen === true && this.$options.isOpen) ) {
      return Promise.resolve(this);
    }

    this.isOpen = false;

    return Promise.all(
      Object.entries(this.$options.styles).map(([refName, { open, active, closed } = {}]) =>
        transition(
          this.$refs[refName],
          {
            from: open,
            active,
            to: closed,
          },
          'keep'
        )
      )
    ).then(async () => {
      await this.setPosition('top');
      this.$emit('close');
      this.$refs.container.setAttribute('aria-hidden', 'true');

      return Promise.resolve(this)
    });
  }
}
