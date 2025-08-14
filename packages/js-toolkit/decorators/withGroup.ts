import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';

let groups = new Map<string, Set<Base>>();

export interface WithGroupProps extends BaseProps {
  $options: {
    group: string;
  };
}

export interface WithGroupInterface extends BaseInterface {
  $group: Set<Base>;
}

/**
 * Add group features to easily bind multiple components together.
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

    get $group() {
      const { group } = this.$options;
      return groups.get(group) ?? groups.set(group, new Set()).get(group);
    }

    constructor(element: HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        const { group: groupName } = this.$options;
        let group = groups.get(groupName);
        if (!group) {
          group = new Set();
          groups.set(groupName, group);
        }
        group.add(this);
      });
      this.$on('destroyed', () => {
        const { group: groupName } = this.$options;
        const group = groups.get(groupName);
        group?.delete(this);
        if (group.size <= 0) {
          groups.delete(groupName)
        }
      });
    }
  };
}
