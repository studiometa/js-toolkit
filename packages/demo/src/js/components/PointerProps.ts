import { Base, withRelativePointer } from '@studiometa/js-toolkit';
import type { BaseConfig, BaseProps, PointerServiceProps } from '@studiometa/js-toolkit';

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
    refs: ['props'],
  };

  movedrelative(props: PointerServiceProps) {
    this.$refs.props.textContent = JSON.stringify(props, null, 2);
  }
}
