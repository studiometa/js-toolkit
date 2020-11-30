import Base from '../abstracts/Base';
import damp from '../utils/math/damp';
import matrix from '../utils/css/matrix';

/**
 * Custom cursor component.
 */
export default class Cursor extends Base {
  /**
   * Class config.
   */
  get config() {
    return {
      name: 'Cursor',
      growSelectors: '[data-cursor-grow], [data-cursor-grow] *',
      shrinkSelectors: '[data-cursor-shrink], [data-cursor-shrink] *',
      growTo: 2,
      shrinkTo: 0.5,
      translateDampFactor: 0.25,
      growDampFactor: 0.075,
      shrinkDampFactor: 0.25,
    };
  }

  /**
   * Mounted hook.
   */
  mounted() {
    this.x = 0;
    this.y = 0;
    this.scale = 0;
    this.pointerX = 0;
    this.pointerY = 0;
    this.pointerScale = 0;
    this.render();
  }

  /**
   * Moved hook.
   * @param {PointerServiceProps} { event, x, y, isDown }
   */
  moved({ event, x, y, isDown }) {
    this.pointerX = x;
    this.pointerY = y;

    let scale = 1;

    if (!event) {
      this.scale = scale;
      return;
    }

    const shouldGrow = event.target.matches(this.$options.growSelectors) || false;
    const shouldReduce = isDown || event.target.matches(this.$options.shrinkSelectors) || false;

    if (shouldGrow) {
      scale = this.$options.growTo;
    }

    if (shouldReduce) {
      scale = this.$options.shrinkTo;
    }

    this.pointerScale = scale;
  }

  /**
   * RequestAnimationFrame hook.
   */
  ticked() {
    this.x = damp(this.pointerX, this.x, this.$options.translateDampFactor);
    this.y = damp(this.pointerY, this.y, this.$options.translateDampFactor);
    this.scale = damp(
      this.pointerScale,
      this.scale,
      this.pointerScale < this.scale ? this.$options.shrinkDampFactor : this.$options.growDampFactor
    );

    this.render();
  }

  /**
   * Render the cursor
   */
  render() {
    const transform = matrix({
      translateX: `${this.x}`,
      translateY: `${this.y}`,
      scaleX: `${this.scale}`,
      scaleY: `${this.scale}`,
    });
    this.$el.style.transform = `translateZ(0) ${transform}`;
  }
}
