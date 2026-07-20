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
 * Options for the `withGroup` decorator.
 */
export interface WithGroupOptions<T extends Base = Base, Scope extends object = object> {
  /**
   * Resolve the scope an instance belongs to. Return `undefined` to fall back
   * to the global (unscoped) registry.
   */
  getScope?: (instance: T) => Scope | undefined;
  /**
   * Resolve the group name of an instance, optionally using its resolved scope.
   * Defaults to `instance.$options.group`.
   */
  getGroup?: (instance: T, scope: Scope | undefined) => string;
}

/**
 * Get global groups map.
 */
function groups<T extends Base = Base>(): Map<string, Set<T>> {
  return (globalThis.__JS_TOOLKIT_GROUPS__ ??= new Map<string, Set<T>>());
}

/**
 * Scoped groups registry, keyed by scope identity. Scopes are stored in a
 * `WeakMap` so they can be garbage-collected once no longer referenced.
 */
const scopedGroups = new WeakMap<object, Map<string, Set<Base>>>();

/**
 * Enumerate the scoped groups registered for a given scope.
 *
 * Returns the live `Map` of `${namespace}${group}` keys to their members set
 * for the given scope, or an empty `Map` for unknown scopes. Unknown scopes are
 * NOT registered as a side effect of reading.
 */
export function getScopedGroups(scope: object): Map<string, Set<Base>> {
  return scopedGroups.get(scope) ?? new Map<string, Set<Base>>();
}

/**
 * Get the members set for a given `(scope, key)` pair, creating it if needed.
 * When `scope` is `undefined`, the global (unscoped) registry is used.
 */
function resolveGroupSet(scope: object | undefined, key: string): Set<Base> {
  if (scope) {
    let map = scopedGroups.get(scope);
    if (!map) {
      map = new Map<string, Set<Base>>();
      scopedGroups.set(scope, map);
    }
    let set = map.get(key);
    if (!set) {
      set = new Set<Base>();
      map.set(key, set);
    }
    return set;
  }

  const registry = groups();
  return registry.get(key) ?? registry.set(key, new Set()).get(key)!;
}

/**
 * Add group features to easily bind multiple components together.
 *
 * @link https://js-toolkit.studiometa.dev/api/decorators/withGroup.html
 */
export function withGroup<S extends Base = Base, Scope extends object = object>(
  BaseClass: typeof Base,
  namespace = '',
  options: WithGroupOptions<S, Scope> = {},
): BaseDecorator<WithGroupInterface, S, WithGroupProps> {
  const getScope = options.getScope;
  const getGroup = options.getGroup ?? ((instance: S) => instance.$options.group);

  // @ts-expect-error Decorators can not be typed.
  return class WithGroup<T extends BaseProps = BaseProps> extends BaseClass<T & WithGroupProps> {
    static config: BaseConfig = {
      ...BaseClass.config,
      options: {
        group: String,
      },
    };

    /**
     * The members set remembered at mount time, if any.
     *
     * @private
     */
    __groupSnapshot: Set<Base> | undefined = undefined;

    /**
     * Resolve the members set for the current scope and group.
     *
     * @private
     */
    __resolveGroup() {
      const scope = getScope?.(this as unknown as S);
      const group = `${namespace}${getGroup(this as unknown as S, scope)}`;
      return resolveGroupSet(scope, group);
    }

    /**
     * Get the group set.
     */
    get $group() {
      const instances = this.__groupSnapshot ?? this.__resolveGroup();

      for (const instance of instances) {
        if (!instance.$el.isConnected) {
          instances.delete(instance);
        }
      }

      return instances;
    }

    constructor(element: HTMLElement) {
      super(element);

      this.$on('mounted', () => {
        // Resolve the members set through the public `$group` getter so that
        // subclasses overriding it keep receiving the membership writes. At this
        // point `__groupSnapshot` is still `undefined`, so the base getter
        // resolves fresh (identical behaviour for non-overriding classes).
        // Remember the exact set the instance was added to so that on destroy a
        // member is always removed from the set it joined, even if the scope or
        // group would now resolve differently.
        const instances = this.$group;
        instances.add(this);
        this.__groupSnapshot = instances;
      });
      this.$on('destroyed', () => {
        this.__groupSnapshot?.delete(this);
        this.__groupSnapshot = undefined;
      });
    }
  };
}
