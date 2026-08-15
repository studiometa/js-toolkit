import type { ComponentImporter } from './Base.js';
import { DIAGNOSTICS, warnOnce } from './diagnostics.js';
import type { MountStrategy } from './mount-strategies.js';
import type { ComponentManifest } from './registry.js';

/** Lazy module importers keyed by the paths a bundler matched. */
export type ModuleRecord = Record<string, ComponentImporter>;

/** Options accepted by {@link defineManifest}. */
export interface DefineManifestOptions {
  /** Lazy module importers keyed by their matched paths. */
  modules: ModuleRecord;
  /** One mount strategy for every generated entry. Defaults to `eager`. */
  mountStrategy?: MountStrategy;
}

/** The structural shape of a webpack context, with no webpack dependency. */
export interface WebpackContextLike {
  keys(): string[];
  (id: string): unknown;
}

function deriveToken(path: string): string {
  const segments = path.split('/').filter((segment) => segment && segment !== '.');
  const last = segments.at(-1) ?? '';
  const base = last.replace(/\.[^.]+$/, '');
  return base === 'index' && segments.length >= 2 ? (segments.at(-2) as string) : base;
}

/**
 * Build a lazy component manifest from bundler module importers without importing or registering
 * anything. The registry resolves direct classes, named exports and default exports when needed.
 */
export function defineManifest({
  modules,
  mountStrategy,
}: DefineManifestOptions): ComponentManifest {
  const manifest: ComponentManifest = {};
  const paths = new Map<string, string>();

  for (const [path, importer] of Object.entries(modules)) {
    const token = deriveToken(path);
    const firstPath = paths.get(token);
    if (firstPath !== undefined) {
      warnOnce(
        modules,
        `${token}\0${firstPath}\0${path}`,
        DIAGNOSTICS.manifest.duplicateToken,
        `"${token}" is already derived from "${firstPath}"; ignoring "${path}".`,
      );
      continue;
    }

    paths.set(token, path);
    manifest[token] =
      mountStrategy === undefined || mountStrategy === 'eager'
        ? importer
        : { load: importer, mountStrategy };
  }

  return manifest;
}

/** Return a lazy Vite glob unchanged, and reject eager glob values immediately. */
export function fromMetaGlob(glob: Record<string, unknown>): ModuleRecord {
  for (const [path, importer] of Object.entries(glob)) {
    if (typeof importer !== 'function') {
      throw new TypeError(
        `[manifest] fromMetaGlob() expects a lazy glob; "${path}" is not an importer function. Remove the { eager: true } option.`,
      );
    }
  }
  return glob as ModuleRecord;
}

/** Convert a webpack context to lazy importers without loading any matched module. */
export function fromWebpackContext(context: WebpackContextLike): ModuleRecord {
  return Object.fromEntries(
    context.keys().map((key) => [key, () => Promise.resolve(context(key))]),
  ) as ModuleRecord;
}
