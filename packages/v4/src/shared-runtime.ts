const RUNTIME_KEY = Symbol.for('@studiometa/js-toolkit-v4/runtime');
const RUNTIME_REVISION = 1;
const DIAGNOSTIC_PREFIX = '[@studiometa/js-toolkit-v4/runtime]';

interface SharedRuntimeSlot {
  readonly revision: number;
  readonly value: unknown;
}

interface SharedRuntime {
  readonly revision: typeof RUNTIME_REVISION;
  readonly slots: Map<string, SharedRuntimeSlot>;
}

function incompatible(message: string): never {
  throw new Error(`${DIAGNOSTIC_PREFIX} ${message}`);
}

function runtimeFor(host: object): SharedRuntime {
  const globalObject = host as Record<PropertyKey, unknown>;
  const existing = globalObject[RUNTIME_KEY];

  if (existing === undefined) {
    const runtime: SharedRuntime = {
      revision: RUNTIME_REVISION,
      slots: new Map(),
    };
    globalObject[RUNTIME_KEY] = runtime;
    return runtime;
  }

  if (
    typeof existing !== 'object' ||
    existing === null ||
    (existing as Partial<SharedRuntime>).revision !== RUNTIME_REVISION ||
    !((existing as Partial<SharedRuntime>).slots instanceof Map)
  ) {
    return incompatible(
      `An incompatible value already owns globalThis[Symbol.for('@studiometa/js-toolkit-v4/runtime')].`,
    );
  }

  return existing as SharedRuntime;
}

/**
 * Reuse one internal state slot across evaluated copies of v4.
 *
 * Each subsystem owns its narrow value type and schema revision. A revision
 * mismatch is an error: mixing two internal layouts would be less safe than
 * refusing the second copy. This is a fixed compatibility guard, not package
 * version negotiation.
 *
 * @internal
 */
export function getSharedRuntimeSlot<T>(
  name: string,
  revision: number,
  initialize: () => T,
  host: object = globalThis,
): T {
  const runtime = runtimeFor(host);
  const existing = runtime.slots.get(name);

  if (existing) {
    if (existing.revision !== revision) {
      return incompatible(
        `Shared slot "${name}" has revision ${existing.revision}; revision ${revision} is required.`,
      );
    }
    return existing.value as T;
  }

  const value = initialize();
  runtime.slots.set(name, { revision, value });
  return value;
}
