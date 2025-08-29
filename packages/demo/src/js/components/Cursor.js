import { Base } from '@studiometa/js-toolkit';
import { smoothTo, transform } from '@studiometa/js-toolkit/utils';

/**
 * Cursor class.
 */
export default class Cursor extends Base {
  /**
   * Config.
   * @type {import('@studiometa/js-toolkit').BaseConfig}
   */
  static config = {
    name: 'Cursor',
  };

  x = smoothTo(window.innerWidth / 2);

  y = smoothTo(window.innerHeight / 2);

  scale = smoothTo(1, { spring: true });

  /**
   * Moved hook.
   * Update position and scale based on pointer state.
   * @param {import('@studiometa/js-toolkit').PointerServiceProps} props
   */
  moved({ x, y, isDown }) {
    this.x(x);
    this.y(y);
    this.scale(isDown ? 0.75 : 1);
  }

  /**
   * Ticked hook.
   * Update the element's transform on each frame.
   * @returns {() => void} A function to be executed on the "write" step of the DOM Scheduler
   */
  ticked() {
    return () => {
      transform(this.$el, { x: this.x(), y: this.y(), scale: this.scale() });
    };
  }
}
