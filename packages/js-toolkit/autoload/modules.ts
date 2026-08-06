import { DEFAULT_DIAGNOSTIC_PREFIX } from './loader.js';
import type { ModuleRecord } from './define-manifest.js';

/**
 * The structural shape of a webpack context function returned by
 * `import.meta.webpackContext(dir, options)`: it is callable to resolve a module by id and exposes
 * a `keys()` method listing every matched id. Typed structurally to avoid a webpack dependency.
 */
export interface WebpackContextLike {
  /** List every module id the context matched. */
  keys(): string[];
  /** Resolve a module by its id. */
  (id: string): unknown;
}

/**
 * Normalize the record returned by Vite's `import.meta.glob('./x/*.ts')` into a {@link ModuleRecord}.
 *
 * The lazy form of `import.meta.glob` already returns `Record<string, () => Promise<Module>>`, so
 * this is an identity pass with a guard: it throws when any value is not a function, which means the
 * caller passed an eager glob (`import.meta.glob('...', { eager: true })`) — an unsupported shape,
 * because eager globs resolve the modules synchronously and defeat on-demand loading.
 */
export function fromMetaGlob(glob: Record<string, unknown>): ModuleRecord {
  for (const [key, value] of Object.entries(glob)) {
    if (typeof value !== 'function') {
      throw new TypeError(
        `${DEFAULT_DIAGNOSTIC_PREFIX} fromMetaGlob() expects a lazy glob but "${key}" is not an importer function; drop the { eager: true } option.`,
      );
    }
  }
  return glob as ModuleRecord;
}

/**
 * Normalize a webpack context — the value returned by
 * `import.meta.webpackContext(dir, { recursive, regExp, mode })` — into a {@link ModuleRecord}.
 *
 * A webpack context is a callable with a `keys()` method rather than a record of importers, so this
 * wraps each key in `() => Promise.resolve(context(key))`. `Promise.resolve` tolerates both a
 * synchronous module (`mode: 'sync'`) and a promise (`mode: 'lazy'`) uniformly. Use `mode: 'lazy'`
 * for real code-splitting and on-demand loading; the other modes bundle every match eagerly.
 */
export function fromWebpackContext(context: WebpackContextLike): ModuleRecord {
  return Object.fromEntries(
    context
      .keys()
      .map((key) => [key, () => Promise.resolve(context(key) as Record<string, unknown>)]),
  ) as ModuleRecord;
}
