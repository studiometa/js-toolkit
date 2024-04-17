import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

/**
 * Override the name of the given component.
 */
export function withName<S extends Base = Base>(
  BaseClass: typeof Base,
  name: string,
): BaseDecorator<BaseInterface, S, BaseProps> {
  // @ts-ignore
  return class extends BaseClass {
    static config: BaseConfig = {
      ...BaseClass.config,
      name,
    };
  };
}
