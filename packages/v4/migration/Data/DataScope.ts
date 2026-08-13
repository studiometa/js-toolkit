import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import {
  DataRegistry,
  DataRegistryContext,
  type DataScopeMember,
  type DataValue,
} from './registry.js';

export type DataScopeProps = BaseProps & {
  $options: {
    group: string;
  };
};

/**
 * DataScope — a local boundary and default group for descendant Data
 * components.
 *
 * Port of `@studiometa/ui` 1.10's `DataScope` (350 lines → 96 here).
 *
 * ## What happened to the other 250 lines
 *
 * They were never about being a component. `__groups`, `__getRecord`,
 * `__getInstances`, `__getMultipleSourcesValue`, `__notifyValue`, `setValue`,
 * `deleteValue`, `hydrate` and `getDataScope` are one data structure and its
 * reconciliation, and v3 had to hang them off a component because the group
 * primitive it built on (`withGroup` + `getScopedGroups`) had **no value
 * cell** — only a `Set` of peers. So the component became the cell.
 *
 * With provide/inject the cell is the provided value, and the component is
 * the thing that decides *where the boundary is*. Everything else moved to
 * `registry.ts`, where the page-wide root registry reuses it verbatim. That
 * is what closes DESIGN.md's "two registries meant two sets of semantics for
 * one channel": there is one `DataRegistry` class and two instances of it.
 *
 * ## What changed
 *
 * | change | forced by |
 * | --- | --- |
 * | `getScopedGroups(this)` → `registry.members(group)` | v4 exports no `withGroup`; membership lives beside the value it is about |
 * | `getDataScope(el)` DOM walk → `injectContextSync(el, DataRegistryContext)` | the context protocol resolves through the DOM event path, nearest first |
 * | the `globalThis` `WeakMap` of channels → `provideRootContext` | DESIGN.md §5: the page-wide case is the outermost scope, not a second mechanism |
 * | `nextTick()` hydration → `defaultScheduler.background()` | v4 ships no `nextTick`, and the background lane is where eager mounts already queue — a stronger guarantee than a microtask |
 *
 * ## What this component no longer has to do
 *
 * It had a `mounted()` whose only job was to tell every `Data` member below it
 * to resolve its registry again — eight lines of `RESCOPE` broadcast, the one
 * piece of the port that was not a port. It existed because an answered
 * context request used to be deleted, so a scope that mounted around members
 * which had already fallen back to the page-wide registry could never take
 * them back.
 *
 * Core closed that: a member now asks with `subscribe: true`, and the mount
 * announcement this component already dispatches is what re-answers it. The
 * boundary is the field initializer below and nothing else — which is what
 * "the component decides *where* the boundary is" was supposed to mean.
 */
export class DataScope extends Base<DataScopeProps> {
  static config: BaseConfig = {
    name: 'DataScope',
    options: {
      group: {
        type: String,
        default: 'default',
      },
    },
  };

  /**
   * The boundary, provided from a **field initializer** — which is the whole
   * reason the ordinary case needs nothing else.
   *
   * `$provide` calls `provideContext`, which calls `addEventListener`
   * immediately. Field initializers run during construction, so a `DataScope`
   * answers `context-request` from the moment it is constructed, before it is
   * mounted and before anything it contains has run a line. The registry
   * scans an inserted subtree in document order, so an ancestor is
   * constructed first and every descendant resolves correctly with no
   * ordering rule to remember.
   */
  registry = this.$provide(
    DataRegistryContext,
    new DataRegistry({
      scoped: true,
      defaultGroup: () => this.$options.group,
      isReady: () => this.$isMounted,
    }),
  );

  /**
   * The live peer set for a group inside this scope.
   */
  getGroup(group: string): Set<DataScopeMember> {
    return this.registry.members(group);
  }

  getData(group: string): Readonly<Record<string, DataValue>> {
    return this.registry.getData(group);
  }

  setValue(group: string, key: string, value: DataValue, source?: DataScopeMember): void {
    this.registry.setValue(group, key, value, source);
  }

  deleteValue(group: string, key: string, source: DataScopeMember): void {
    this.registry.deleteValue(group, key, source);
  }

  hydrate(group: string, member: DataScopeMember): void {
    this.registry.hydrate(group, member);
  }
}
