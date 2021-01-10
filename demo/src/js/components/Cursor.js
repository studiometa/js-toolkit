import Base from '~/src';

export default class Cursor extends Base {
  get config() {
    return {
      name: 'Cursor',
      refs: ['inner'],
    };
  }

  moved({ x, y, delta, isDown }) {
    let transform = `translate3d(${x}px, ${y}px, 0)`;

    if (isDown) {
      transform += ` scale(0.75)`;
    }

    this.$el.style.transform = transform;
    this.$refs.inner.style.transform = `translate3d(${delta.x * -1}px, ${delta.y * -1}px, 0)`;
  }
}
