import {
  signal,
  type Signal,
  createContext,
  defaultScheduler,
  injectContextSync,
  provideRootContext,
} from '../../src/index.js';

/**
 * The group registry — what `withGroup` + `getScopedGroups` + `DataChannel`
 * collapse into on v4.
 *
 * ## Why this file exists
 *
 * v3 spread one concept over three mechanisms:
 *
 * - `withGroup(Base, 'data:', { getScope, getGroup })` kept a `Set` of peers
 *   per (scope, group name) pair, resolved through `getScopedGroups()`;
 * - `DataScope.__groups` kept the keyed values, the sources and the hydration
 *   bookkeeping for the scoped half;
 * - `DataChannel` + a `WeakMap` hung off `globalThis` kept the *value cell*,
 *   because a member `Set` has none — which is the whole reason ui had to
 *   write `getDataChannel(this.$group)` on top of `withGroup`.
 *
 * v4 exports no group primitive at all (check `src/index.ts` — there is no
 * `withGroup`), and DESIGN.md §5 says why: `provideRootContext()` makes the
 * page-wide case the outermost scope of provide/inject rather than a second
 * registry beside it. So the three become one object, provided on a key:
 * a `DataScope` provides its own, and a member with no `DataScope` above it
 * resolves the root one. Nearest wins, by `stopPropagation`, for free.
 *
 * ## The named/dynamic problem, and where the keyed map belongs
 *
 * `createContext()` yields one static symbol; Data groups are **named at
 * runtime** from an option (`data-option-group="checkout"`). The bridge is a
 * keyed map behind a single key — and the map belongs *inside the provided
 * value*, not in a `Map<string, ContextKey>` beside it:
 *
 * - a key-per-group map would have to live in a module-level cache to be
 *   shared, which is the `globalThis` registry v4 just removed;
 * - the value provided is what a consumer resolves verbatim, so putting the
 *   naming *inside* it keeps one key, one provider, one lifetime;
 * - and the scoped half needs more than a channel anyway (values, sources,
 *   hydration), which a bare `ContextKey<Signal>` cannot carry.
 *
 * One key, one registry object, `registry.group(name)` inside it.
 */

export type DataValue = boolean | string | string[] | number | Date | null | undefined;

/**
 * One published frame. Always a fresh object (see `publish()`), so a value
 * that repeats is still an observable event.
 */
export interface DataUpdate {
  readonly force: boolean;
  readonly key?: string;
  readonly source?: DataScopeMember;
  readonly value: DataValue;
}

/**
 * What the registry needs of a member. Structural rather than
 * `extends Base`, so the registry never imports a component.
 */
export interface DataScopeMember {
  readonly $el: HTMLElement;
  readonly target: HTMLElement;
  readonly dataKey: string;
  readonly isDataSource: boolean;
  readonly $isMounted: boolean;
  get(): DataValue;
  set(value: DataValue, dispatch?: boolean): void;
  dispatchScopedValue(value: DataValue, updateData?: boolean): void;
}

interface DataGroupRecord {
  channel: Signal<DataUpdate | null>;
  latest: DataUpdate | null;
  members: Set<DataScopeMember>;
  sources: Map<string, Set<DataScopeMember>>;
  values: Map<string, DataValue>;
  data: Readonly<Record<string, DataValue>>;
  hydration: Set<DataScopeMember>;
  hydrationPending: boolean;
}

const EMPTY_DATA: Readonly<Record<string, DataValue>> = Object.freeze({});

/**
 * The one construction seam for core's reactive cell.
 *
 * Core is mid-move from the eager `Signal` class to a functional
 * `signal(initial)` factory keeping `Signal` as the exported *type*. Only
 * construction changes, and only here — everything else in this port reads
 * `.value` and calls `.subscribe()`, which both spellings share.
 */
function createChannel(): Signal<DataUpdate | null> {
  return signal<DataUpdate | null>(null);
}

function cloneValue(value: DataValue): DataValue {
  if (Array.isArray(value)) {
    return [...value];
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  return value;
}

function createSnapshot(values: Map<string, DataValue>): Readonly<Record<string, DataValue>> {
  const entries = Array.from(values, ([key, value]) => {
    const snapshotValue = cloneValue(value);
    if (Array.isArray(snapshotValue) || snapshotValue instanceof Date) {
      Object.freeze(snapshotValue);
    }
    return [key, snapshotValue] as const;
  });
  return Object.freeze(Object.fromEntries(entries));
}

/**
 * A radio that is not checked never speaks for its key.
 */
function isCurrentValueSource(instance: DataScopeMember): boolean {
  const { $el } = instance;
  return !($el instanceof HTMLInputElement && $el.type === 'radio' && !$el.checked);
}

export interface DataRegistryOptions {
  /**
   * Whether keyed values live here. A `DataScope` owns a scoped registry;
   * the page-wide root one carries channels and membership only, which is
   * exactly what v3's `globalThis` `WeakMap` of `DataChannel`s did.
   */
  scoped?: boolean;
  /** The group a member falls back to. Live, since it comes from an option. */
  defaultGroup?: () => string;
  /** Whether the owning scope is currently mounted — guards hydration. */
  isReady?: () => boolean;
}

export class DataRegistry {
  readonly scoped: boolean;

  #defaultGroup: () => string;

  #isReady: () => boolean;

  #groups = new Map<string, DataGroupRecord>();

  constructor({
    scoped = false,
    defaultGroup = () => '',
    isReady = () => true,
  }: DataRegistryOptions = {}) {
    this.scoped = scoped;
    this.#defaultGroup = defaultGroup;
    this.#isReady = isReady;
  }

  get defaultGroup(): string {
    return this.#defaultGroup();
  }

  /**
   * The record for a group name, reconciled against the DOM on every access.
   *
   * The reconciliation is v3's, kept verbatim in intent: a source whose
   * element left the document stops owning its key **synchronously**, without
   * waiting for the registry's MutationObserver. ui's specs assert exactly
   * that (`input.remove()` then `scope.getData(...)` on the next line), and
   * v4's teardown is a background task, so dropping this would turn a
   * synchronous guarantee into an asynchronous one.
   *
   * @private
   */
  #record(group: string): DataGroupRecord {
    let record = this.#groups.get(group);

    if (!record) {
      record = {
        channel: createChannel(),
        latest: null,
        members: new Set(),
        sources: new Map(),
        values: new Map(),
        data: EMPTY_DATA,
        hydration: new Set(),
        hydrationPending: false,
      };
      this.#groups.set(group, record);
    }

    for (const member of record.members) {
      if (!member.$el.isConnected) {
        record.members.delete(member);
      }
    }

    if (!this.scoped) {
      return record;
    }

    const deletedKeys: string[] = [];
    const updatedValues = new Map<string, DataValue>();
    for (const [key, sources] of record.sources) {
      let sourcesChanged = false;
      for (const source of sources) {
        if (!source.$el.isConnected) {
          sources.delete(source);
          sourcesChanged = true;
        }
      }

      if (sources.size === 0) {
        record.sources.delete(key);
        if (record.values.delete(key)) {
          deletedKeys.push(key);
        }
      } else if (sourcesChanged && group.endsWith('[]')) {
        const value = multipleSourcesValue(sources);
        record.values.set(key, value);
        updatedValues.set(key, value);
      }
    }

    if (deletedKeys.length > 0 || updatedValues.size > 0) {
      record.data = createSnapshot(record.values);
      for (const key of deletedKeys) {
        this.#notify(record, key, undefined);
      }
      for (const [key, value] of updatedValues) {
        this.#notify(record, key, value);
      }
    }

    return record;
  }

  /**
   * @private
   */
  #notify(
    record: DataGroupRecord,
    key: string,
    value: DataValue,
    excludedSource?: DataScopeMember,
  ): void {
    this.#publishTo(record, { force: true, key, source: excludedSource, value });
  }

  /**
   * @private
   */
  #publishTo(record: DataGroupRecord, update: DataUpdate): DataUpdate {
    // Always a fresh frame, so equal values stay observable events. The
    // consequence for core: a value-equality bail-out in the signal never
    // fires here, and what this relies on instead is **deduped delivery of
    // the latest frame** — see `isCurrent()`.
    const frame = { ...update };
    record.latest = frame;
    record.channel.value = frame;
    return frame;
  }

  /**
   * Join a group. Returns the leave function, so a member's `mounted()` hands
   * it straight back as a cleanup and membership follows the mount cycle.
   */
  join(group: string, member: DataScopeMember): () => void {
    const record = this.#record(group);
    record.members.add(member);
    return () => record.members.delete(member);
  }

  /**
   * The live peer set for a group. This is `withGroup`'s `$group`, minus the
   * decorator — and unlike it, the value cell lives beside it.
   */
  members(group: string): Set<DataScopeMember> {
    return this.#record(group).members;
  }

  publish(group: string, update: DataUpdate): DataUpdate {
    return this.#publishTo(this.#record(group), update);
  }

  /**
   * Whether `frame` is still the newest frame on this group.
   *
   * A subscriber may publish from inside its own delivery — `DataComputed`
   * recomputing, an `Action` writing back. When that happens the outer frame
   * is superseded and the member that started it must **not** apply its own
   * stale value on top. This is the reentrancy hazard ui's
   * `should preserve the latest value during reentrant group updates` encodes.
   */
  isCurrent(group: string, frame: DataUpdate): boolean {
    return this.#record(group).latest === frame;
  }

  subscribe(group: string, subscriber: (update: DataUpdate) => void): () => void {
    const record = this.#record(group);
    return record.channel.subscribe((update) => {
      // `null` is the initial cell value, not a publication. v3 needed a
      // sentinel symbol plus an `initialized` flag because `effect()` runs
      // its body once to collect dependencies; `Signal.subscribe` does not.
      if (update !== null) {
        subscriber(update);
      }
    });
  }

  getData(group: string): Readonly<Record<string, DataValue>> {
    return this.#record(group).data;
  }

  setValue(group: string, key: string, value: DataValue, source?: DataScopeMember): void {
    const record = this.#record(group);

    if (source) {
      const { members } = record;
      if (source.$el instanceof HTMLInputElement && source.$el.type === 'radio') {
        const matchingSource =
          source.$el.value === value
            ? source
            : Array.from(members).find(
                (member) =>
                  member.dataKey === key &&
                  member.$el instanceof HTMLInputElement &&
                  member.$el.type === 'radio' &&
                  member.$el.value === value,
              );
        record.sources.set(key, new Set([matchingSource ?? source]));
      } else {
        const sources = record.sources.get(key) ?? new Set();
        sources.add(source);
        for (const member of members) {
          if (member.isDataSource && member.dataKey === key) {
            sources.add(member);
          }
        }
        record.sources.set(key, sources);
      }
    }

    record.values.set(key, cloneValue(value));
    record.data = createSnapshot(record.values);
  }

  deleteValue(group: string, key: string, source: DataScopeMember): void {
    const record = this.#record(group);
    const sources = record.sources.get(key);

    if (!sources?.delete(source)) {
      return;
    }

    if (sources.size === 0) {
      record.sources.delete(key);
      record.values.delete(key);
      record.data = createSnapshot(record.values);
      this.#notify(record, key, undefined, source);
    } else if (group.endsWith('[]')) {
      const value = multipleSourcesValue(sources);
      record.values.set(key, value);
      record.data = createSnapshot(record.values);
      this.#notify(record, key, value, source);
    }
  }

  /**
   * Collect every immediate source of a group, once, then announce.
   *
   * The batching is the point: three `data-option-immediate` inputs must not
   * make subscribers see a half-filled `$data` twice on the way to the full
   * one. v3 deferred the collection with `nextTick()`; this uses the
   * scheduler's **background lane**, which is where v4 already queues eager
   * mounts — so the collection is guaranteed to run after every mount already
   * queued, not merely after the current microtask checkpoint.
   */
  hydrate(group: string, member: DataScopeMember): void {
    if (!this.scoped || !member.isDataSource) {
      return;
    }

    const record = this.#record(group);
    record.hydration.add(member);

    if (record.hydrationPending) {
      return;
    }
    record.hydrationPending = true;

    defaultScheduler.background(() => {
      const sources = new Map<string, DataScopeMember>();

      if (this.#isReady()) {
        for (const source of record.hydration) {
          if (
            source.$isMounted &&
            source.$el.isConnected &&
            source.dataKey &&
            isCurrentValueSource(source)
          ) {
            sources.set(source.dataKey, source);
            record.values.set(source.dataKey, cloneValue(source.get()));

            if (source.$el instanceof HTMLInputElement && source.$el.type === 'radio') {
              record.sources.set(source.dataKey, new Set([source]));
            } else {
              const valueSources = record.sources.get(source.dataKey) ?? new Set();
              valueSources.add(source);
              for (const peer of record.members) {
                if (peer.isDataSource && peer.dataKey === source.dataKey) {
                  valueSources.add(peer);
                }
              }
              record.sources.set(source.dataKey, valueSources);
            }
          }
        }
      }

      record.hydration.clear();
      record.hydrationPending = false;
      record.data = createSnapshot(record.values);

      for (const source of sources.values()) {
        source.dispatchScopedValue(source.get(), false);
      }
    });
  }
}

/**
 * A `[]` group takes the union of what its checked members hold.
 */
function multipleSourcesValue(sources: Set<DataScopeMember>): string[] {
  const values = new Set<string>();

  for (const source of sources) {
    if (source.$el instanceof HTMLInputElement && source.$el.type === 'checkbox') {
      if (source.$el.checked) {
        values.add(source.$el.value);
      }
      continue;
    }

    const value = source.get();
    if (Array.isArray(value)) {
      for (const item of value) {
        values.add(item);
      }
    }
  }

  return Array.from(values);
}

export const DataRegistryContext = /* @__PURE__ */ createContext<DataRegistry>('data-registry');

/**
 * The nearest registry for an element: a `DataScope`'s if one provides above
 * it, the page-wide one otherwise.
 *
 * This is the whole of `getDataScope()`'s DOM walk plus v3's `globalThis`
 * fallback, in two lines, because `provideRootContext` puts the page-wide
 * value on `document.documentElement` and any `DataScope` above the element
 * answers first by `stopPropagation`.
 *
 * **`injectContextSync` and not `injectContext`, deliberately.** The async
 * form is the right default when "no provider yet" must not be mistaken for
 * "no provider ever" — but here there is always an answer, because the root
 * registry is created on demand. A pending promise would buy nothing and cost
 * the synchronous read that `get()`/`set()` are specified to be.
 *
 * It is also what makes a subscription usable here at all: a member calls
 * `subscribeContext()` from `mounted()`, which waits forever while nothing
 * provides, and calling this creates the page-wide provider that answers it.
 * So this stays the fallback path for subscribed members — see
 * `DataBind.mounted()`.
 */
export function resolveDataRegistry(el: Element): DataRegistry {
  return (
    injectContextSync(el, DataRegistryContext) ??
    provideRootContext(DataRegistryContext, () => new DataRegistry())
  );
}
