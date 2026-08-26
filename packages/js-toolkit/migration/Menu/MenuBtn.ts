import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';

export type MenuBtnProps = BaseProps;

/**
 * The toggle button child of a `Menu`. It tracks its own hover state and
 * stops propagation of `mouseenter`/`mouseleave` so a wrapping `MenuList`
 * does not also count the button as hovered.
 *
 * @link https://ui.studiometa.dev/reference/items/Menu/
 */
export class MenuBtn<T extends BaseProps = BaseProps> extends Base<MenuBtnProps & T> {
  static config: BaseConfig = {
    name: 'MenuBtn',
  };

  isHover = false;

  onMouseenter(event: MouseEvent): void {
    this.isHover = true;
    event.stopPropagation();
  }

  onMouseleave(event: MouseEvent): void {
    this.isHover = false;
    event.stopPropagation();
  }
}
