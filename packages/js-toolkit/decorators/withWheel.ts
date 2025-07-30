import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import type { WheelServiceProps } from '../services/WheelService.js';
import { useWheel } from '../services/WheelService.js';

export interface WithWheelInterface extends BaseInterface {
  wheeled?(props: WheelServiceProps): void;
}

/**
 * Add dragging capabilities to a component.
 */
export function withWheel<S extends Base>(BaseClass: typeof Base): BaseDecorator<BaseInterface, S> {
  /**
   * Class.
   */
  class WithWheel<T extends BaseProps = BaseProps> extends BaseClass<T & WithWheelInterface> {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      emits: ['wheeled'],
    };

    /**
     * Class constructor.
     */
    constructor(element: HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        this.$services.register('wheeled', useWheel.bind(null));
        this.$services.enable('wheeled');
      });

      this.$on('destroyed', () => {
        this.$services.disable('wheeled');
        this.$services.unregister('wheeled');
      });
    }
  }

  // @ts-ignore
  return WithWheel;
}
