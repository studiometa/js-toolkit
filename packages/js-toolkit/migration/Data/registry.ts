import {
  signal,
  type Signal,
  createContext,
  defaultScheduler,
  injectContextSync,
  provideRootContext,
} from '../../src/index.js';

/** Stores named data groups, values, sources, membership, and hydration state. */

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

/** Construction seam for the group signal. */
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
  /** Whether this registry stores keyed values. */
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

  /** Reconcile disconnected members synchronously on every access. @private */
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
    // A fresh frame keeps equal values observable.
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

  /** The live peer set for a group. */
  members(group: string): Set<DataScopeMember> {
    return this.#record(group).members;
  }

  publish(group: string, update: DataUpdate): DataUpdate {
    return this.#publishTo(this.#record(group), update);
  }

  /** Whether a frame is still current after possible reentrant publication. */
  isCurrent(group: string, frame: DataUpdate): boolean {
    return this.#record(group).latest === frame;
  }

  subscribe(group: string, subscriber: (update: DataUpdate) => void): () => void {
    const record = this.#record(group);
    return record.channel.subscribe((update) => {
      // `null` is the initial cell value, not a publication.
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

  /** Collect all immediate sources before notifying subscribers. The background lane runs after queued eager mounts. */
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

/** Resolve the nearest registry synchronously, creating the page-wide root if needed. */
export function resolveDataRegistry(el: Element): DataRegistry {
  return (
    injectContextSync(el, DataRegistryContext) ??
    provideRootContext(DataRegistryContext, () => new DataRegistry())
  );
}
