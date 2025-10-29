import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

export interface WithGroupProps extends BaseProps {
  $options: {
    group: string;
  };
}

export interface WithGroupInterface extends BaseInterface {
  get $group(): Set<Base>;
}

/**
 * Get global groups map.
 */
function groups<T extends Base = Base>(): Map<string, Set<T>> {
  return (globalThis.__JS_TOOLKIT_GROUPS__ ??= new Map<string, Set<T>>());
}

/**
 * Add group features to easily bind multiple components together.
 *
 * @link https://js-toolkit.studiometa.dev/api/decorators/withGroup.html
 */
export function withGroup<S extends Base = Base>(
  BaseClass: typeof Base,
): BaseDecorator<WithGroupInterface, S, WithGroupProps> {
  // @ts-expect-error Decorators can not be typed.
  return class WithGroup<T extends BaseProps = BaseProps> extends BaseClass<T & WithGroupProps> {
    static config: BaseConfig = {
      ...BaseClass.config,
      options: {
        group: String,
      },
    };

    /**
     * Get the group set.
     */
    get $group() {
      const { group } = this.$options;
      return groups<this>().get(group) ?? groups<this>().set(group, new Set()).get(group);
    }

    constructor(element: HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        this.$group.add(this);
      });
      this.$on('destroyed', () => {
        this.$group.delete(this);
      });
    }
  };
}
