import { Base, type BaseConfig, type BaseProps, type MountedReturn } from '../../src/index.js';
import {
  DataRegistry,
  DataRegistryContext,
  RESCOPE,
  type DataScopeMember,
  type DataValue,
  type Rescopable,
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
 * | nothing | the `RESCOPE` broadcast below, which is **not** a port — it is new, and it exists because core cannot express what it does |
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
   * Reclaim members that resolved before this scope existed.
   *
   * **This is the one thing in the port that core cannot do**, and it is
   * worth stating precisely rather than hiding behind the workaround.
   *
   * `provideContext()` replays to *pending* requests when a late provider
   * appears — but a request is deleted from `pendingRequests` the moment
   * anything answers it. Combined with `provideRootContext`, which provides
   * on `document.documentElement` and therefore answers a request from
   * anywhere, that means: **once the page-wide registry exists, every
   * unscoped request is answered immediately and permanently, and a nearer
   * provider mounting later can never take those consumers back.** Neither
   * `$inject` nor `$injectSync` changes this; the two differ in when the
   * consumer asks, not in who may answer it afterwards.
   *
   * For most consumers that is right — a `SliderBtn` that found a `Slider`
   * should keep it. For a `Data` member it is wrong, because falling back is
   * not a degradation here: it silently binds the member to the page-wide
   * channel, where it will happily exchange values with unrelated components
   * that happen to share a group name.
   *
   * The cases that reach it, all real:
   *
   * - `registerComponent(DataBind)` called before `registerComponent(DataScope)`
   *   — registration scans per name, so the binds are scheduled first;
   * - a `DataScope` with `data-mount="idle"` / `"visible"` around eager members;
   * - a scope inserted by a `data-bind:if` template around content that was
   *   already there.
   *
   * The fix is eight lines and no framework support: on mount, tell every
   * `Data` member below to resolve again. `injectContextSync` finds the
   * nearest provider, so a member inside a *nested* scope re-resolves to the
   * nested one and nothing is stolen.
   *
   * **Ask for core:** a provider-side announcement — `provideContext` also
   * dispatching a `context-provided` event down its subtree, or a
   * `subscribe: true` request that is re-answered when a nearer provider
   * appears (the WICG context protocol has exactly this in its `subscribe`
   * flag, and v4 implements the protocol without it). Every keyed,
   * name-resolved channel will need it; this is the second family to want it
   * after `Slider` wanted `$injectSync`.
   */
  mounted(): MountedReturn {
    for (const el of this.$el.querySelectorAll('*')) {
      for (const instance of el.__base__?.values() ?? []) {
        (instance as Partial<Rescopable>)[RESCOPE]?.();
      }
    }
  }

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
