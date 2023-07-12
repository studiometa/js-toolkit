import { Base, withRelativePointer } from '@studiometa/js-toolkit';
import type { BaseConfig, BaseProps, PointerServiceProps } from '@studiometa/js-toolkit';
import { transform, clamp01 } from '@studiometa/js-toolkit/utils';

export interface PointerPropsProps extends BaseProps {
  $refs: {
    props: HTMLElement;
  };
}

/**
 * PointerProps class.
 */
export default class PointerProps extends withRelativePointer(Base)<PointerPropsProps> {
  /**
   * Config.
   */
  static config: BaseConfig = {
    name: 'PointerProps',
    refs: ['props', 'scaler'],
  };

  movedrelative(props: PointerServiceProps) {
    this.$refs.props.textContent = JSON.stringify(props, null, 2);
    transform(this.$refs.scaler, {
      scaleX: clamp01(props.progress.x) + 0.5,
      scaleY: clamp01(props.progress.y) + 0.5,
    });
  }
}
