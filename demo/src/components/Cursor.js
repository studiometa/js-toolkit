import { Base } from '../../../src';

export default class Cursor extends Base {
  get config() {
    return {
      name: 'Cursor',
    };
  }

  moved({ x, y, isDown }) {
    let transform = `translate3d(${x}px, ${y}px, 0)`;

    if (isDown) {
      transform += ` scale(0.75)`;
    }

    this.$el.style.transform = transform;
  }
}
