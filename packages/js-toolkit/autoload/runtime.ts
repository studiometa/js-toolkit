import { autoload, type AutoloadHandle } from './autoload.js';
import type { LoaderDependencies } from './loader.js';
import type { ComponentManifest } from './types.js';
import { version } from '../version.js';

/** The identity every copy of this package advertises on the shared global runtime. */
const PACKAGE_NAME = '@studiometa/js-toolkit';
/**
 * The `globalThis` key the shared runtime is stored under. `Symbol.for` guarantees the same symbol
 * across module graphs and bundle copies, so multiple side-effect entries — even from duplicated
 * copies of this package — coordinate through a single runtime object.
 */
const RUNTIME_KEY = Symbol.for('@studiometa/js-toolkit/autoload/runtime');
/** The prefix prepended to every diagnostic message emitted by the shared runtime. */
const DIAGNOSTIC_PREFIX = '[@studiometa/js-toolkit/autoload]';
/** The `<meta>` element carrying the comma-separated list of tokens to mount eagerly. */
const EAGER_META_SELECTOR = 'meta[name="js-toolkit:eager"]';

/** Options accepted by {@link registerManifest}; every seam is optional and testability-oriented. */
export interface RegisterManifestOptions {
  /** The document to scan and to read the eager `<meta>` from. Defaults to the global `document`. */
  document?: Document;
  /** The object the shared runtime is stored on. Defaults to `globalThis`. */
  globalObject?: object;
  /** The identity used by the duplicate/conflict guard. Defaults to this package's version. */
  version?: string;
  /** The DOM scope handed to the loader. Defaults to the resolved document. */
  root?: Document | Element;
  /** Loader dependency-injection seams, forwarded to {@link autoload}. */
  dependencies?: Partial<LoaderDependencies>;
  /** The logger used by the duplicate/conflict guard. Defaults to the global `console`. */
  console?: Pick<Console, 'warn'>;
  /** Schedules the single coalesced start. Defaults to `queueMicrotask`. */
  scheduleMicrotask?: (callback: () => void) => void;
}

/** The shared, cross-copy runtime object stored on `globalThis` under {@link RUNTIME_KEY}. */
export interface AutoloadRuntime {
  /** The owning package name, used by the conflict guard. */
  readonly packageName: typeof PACKAGE_NAME;
  /** The version that first claimed this runtime; conflicting versions are ignored. */
  readonly version: string;
  /** Every manifest registered so far, in registration order. */
  manifests: ComponentManifest[];
  /** The active autoload handle, present once a start has flushed. */
  handle?: AutoloadHandle;
  /** True while a (re)start is scheduled through a microtask but has not flushed yet. */
  pending: boolean;
  /**
   * The resolved options for the next flush. The freshest registration wins so a late import can
   * refresh the document/root before the coalesced start runs.
   *
   * @private
   */
  __pendingOptions?: ResolvedOptions;
}

interface ResolvedOptions {
  documentObject: Document;
  globalObject: object;
  version: string;
  root: Document | Element;
  dependencies?: Partial<LoaderDependencies>;
  logger: Pick<Console, 'warn'>;
  scheduleMicrotask: (callback: () => void) => void;
}

function resolveOptions(options: RegisterManifestOptions): ResolvedOptions {
  const documentObject = options.document ?? document;
  return {
    documentObject,
    globalObject: options.globalObject ?? globalThis,
    version: options.version ?? version,
    root: options.root ?? documentObject,
    dependencies: options.dependencies,
    logger: options.console ?? console,
    scheduleMicrotask: options.scheduleMicrotask ?? ((callback) => queueMicrotask(callback)),
  };
}

/**
 * Read the eager tokens declared by `<meta name="js-toolkit:eager" content="A, B, C">`.
 *
 * The `content` values of every matching meta (in document order) are concatenated, split on
 * commas, trimmed, stripped of empties and deduplicated. When no such meta exists the list is
 * empty.
 */
export function readEagerTokens(documentObject: Document): string[] {
  const metas = [...documentObject.querySelectorAll(EAGER_META_SELECTOR)];
  return [
    ...new Set(
      metas
        .flatMap((meta) => (meta.getAttribute('content') ?? '').split(','))
        .map((token) => token.trim())
        .filter(Boolean),
    ),
  ];
}

function ensureRuntime(resolved: ResolvedOptions): AutoloadRuntime | undefined {
  const host = resolved.globalObject as Record<PropertyKey, unknown>;
  const existing = host[RUNTIME_KEY] as AutoloadRuntime | undefined;
  if (existing) {
    if (existing.packageName === PACKAGE_NAME && existing.version === resolved.version) {
      return existing;
    }

    resolved.logger.warn(
      `${DIAGNOSTIC_PREFIX} A conflicting runtime (version ${existing.version}) is already active; version ${resolved.version} was ignored.`,
    );
    return undefined;
  }

  const runtime: AutoloadRuntime = {
    packageName: PACKAGE_NAME,
    version: resolved.version,
    manifests: [],
    pending: false,
  };
  host[RUNTIME_KEY] = runtime;
  return runtime;
}

function flushStart(runtime: AutoloadRuntime): void {
  runtime.pending = false;
  const resolved = runtime.__pendingOptions;
  if (!resolved) {
    return;
  }

  const manifests = [...runtime.manifests];
  const eager = readEagerTokens(resolved.documentObject);

  // A previous flush may already have produced a loader when a manifest is registered late (after
  // the coalescing microtask fired). Stop it and start a fresh loader over the accumulated set:
  // js-toolkit's `$register` reuses the instance already mounted on an element, so re-scanning never
  // double-mounts, while a single active loader keeps exactly one MutationObserver on the DOM.
  runtime.handle?.stop();
  runtime.handle = autoload({
    manifests,
    root: resolved.root,
    eager,
    dependencies: {
      document: resolved.documentObject,
      diagnosticPrefix: DIAGNOSTIC_PREFIX,
      ...resolved.dependencies,
    },
  });
}

function scheduleStart(runtime: AutoloadRuntime, resolved: ResolvedOptions): void {
  // The freshest registration wins so a late import can refresh the document/root before the flush.
  runtime.__pendingOptions = resolved;
  if (runtime.pending) {
    return;
  }
  runtime.pending = true;
  resolved.scheduleMicrotask(() => flushStart(runtime));
}

/**
 * Register a component manifest with the shared runtime and ensure the autoloader starts.
 *
 * This is the shared engine behind side-effect entries that activate a manifest. It is safe to call
 * from several entries and several bundle copies at once:
 *
 * - The first registration schedules a single start through a microtask. Because every ES module
 *   import in a graph evaluates before microtasks flush, importing several manifest-activating
 *   entries at the top of a module registers every manifest synchronously and results in exactly
 *   ONE {@link autoload} call over the COMPOSED set — never two loaders both scanning the DOM.
 * - A manifest registered after the start already fired is not dropped: it triggers a fresh start
 *   over the accumulated manifests. The previous loader is stopped first, so a single loader stays
 *   active, and js-toolkit's idempotent `$register` prevents any double-mount.
 * - A conflicting activation — a different {@link RegisterManifestOptions.version} claiming an
 *   already-owned runtime — warns and no-ops.
 *
 * Returns the shared runtime, or `undefined` when a conflicting version already owns it.
 */
export function registerManifest(
  manifest: ComponentManifest,
  options: RegisterManifestOptions = {},
): AutoloadRuntime | undefined {
  const resolved = resolveOptions(options);
  const runtime = ensureRuntime(resolved);
  if (!runtime) {
    return undefined;
  }

  if (!runtime.manifests.includes(manifest)) {
    runtime.manifests.push(manifest);
  }
  scheduleStart(runtime, resolved);
  return runtime;
}

/**
 * Register several manifests with the shared runtime in order, then let the single coalesced start
 * flush over the composed set.
 *
 * This is the convenience wrapper an app uses to layer its own components on top of the packaged
 * ones: `registerManifests(baseManifest, custom)`. Because {@link registerManifest} pushes each
 * manifest onto the shared runtime in call order and the loader composes them later-wins, the LAST
 * manifest wins on token collisions — so a custom manifest passed last can override any component
 * that shares a token.
 *
 * Returns the shared runtime from the final registration, or `undefined` when a conflicting version
 * already owns the runtime (or when no manifest was passed).
 */
export function registerManifests(...manifests: ComponentManifest[]): AutoloadRuntime | undefined {
  let runtime: AutoloadRuntime | undefined;
  for (const manifest of manifests) {
    runtime = registerManifest(manifest);
  }
  return runtime;
}
