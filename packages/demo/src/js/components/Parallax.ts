import type { BaseTypeParameter } from '@studiometa/js-toolkit';
import { Base, withScrolledInView, withFreezedOptions } from '@studiometa/js-toolkit';
import { map, transform } from '@studiometa/js-toolkit/utils';

interface ParallaxInterface {
  $options: {
    speed: number;
  }
  $refs: {
    target: HTMLElement
  }
}

const WithScrolledInView = withScrolledInView<ParallaxInterface>(withFreezedOptions(Base))

export default class Parallax<T extends BaseTypeParameter = BaseTypeParameter> extends WithScrolledInView<T>  {
  static config = {
    name: 'Parallax',
    refs: ['target'],
    options: {
      speed: Number,
    },
  };

  scrolledInView(props) {
    const { target } = this.$refs;
    const y = map(props.dampedProgress.y, 0, 1, 100, -100) * this.$options.speed;
    const scale = map(props.dampedProgress.x, 0, 1, 0.5, 2);
    return () => transform(target, { y, scale });
  }
}

