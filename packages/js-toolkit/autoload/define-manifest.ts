import type { BaseConstructor } from '../Base/Base.js';
import { DEFAULT_DIAGNOSTIC_PREFIX } from './loader.js';
import type { ComponentLoadStrategy, ComponentManifest, ComponentManifestEntry } from './types.js';

/**
 * A map of module keys to lazy importers, as produced by bundler glob helpers.
 *
 * This is the shape Vite's `import.meta.glob('./x/*.ts')` returns, and the shape the
 * {@link fromWebpackContext} adapter normalizes a webpack context to. Every value is a function
 * that imports the module and resolves its namespace object.
 */
export type ModuleRecord = Record<string, () => Promise<Record<string, unknown>>>;

/**
 * A per-token override applied on top of the values {@link defineManifest} derives from a module
 * key. Every field is optional; an omitted field keeps the derived or option-level default.
 */
export interface ComponentOverride {
  /** Replace the token derived from the module key. */
  token?: string;
  /** Override the load strategy for this component. */
  strategy?: ComponentLoadStrategy;
  /** Override the grouping key for this component. */
  group?: string;
  /** The named export to resolve from the module; defaults to the derived token. */
  exportName?: string;
  /** The tokens of the constructor's configured child components, for recursive registration. */
  children?: readonly string[];
  /** Stylesheet paths associated with this component (informational). */
  styles?: readonly string[];
  /** Optional integration keys associated with this component (informational). */
  integrations?: readonly string[];
}

/** Options accepted by {@link defineManifest}. */
export interface DefineManifestOptions {
  /**
   * The lazy importers to build entries from, keyed by module path. Feed it a bundler glob directly
   * or normalize one first with {@link fromMetaGlob} / {@link fromWebpackContext}.
   */
  modules: ModuleRecord;
  /** The npm package the components belong to (optional informational metadata). */
  packageName?: string;
  /** The default load strategy for every component. Defaults to `'eager'`. */
  strategy?: ComponentLoadStrategy;
  /** The default grouping key for every component. Defaults to each component's token. */
  group?: string;
  /** Per-token overrides, keyed by the token derived from the module key. */
  components?: Record<string, ComponentOverride>;
}

/**
 * Derive a component token from a module key: the basename without its extension, falling back to
 * the parent directory name when the basename is `index` (so `./a/b/Foo/index.ts` yields `Foo`).
 */
function deriveToken(key: string): string {
  const segments = key.split('/').filter((segment) => segment && segment !== '.');
  const last = segments.at(-1) ?? '';
  const base = last.replace(/\.[^.]+$/, '');
  if (base === 'index' && segments.length >= 2) {
    return segments.at(-2) as string;
  }
  return base;
}

/**
 * Build a {@link ComponentManifest} from a record of lazy importers — the pure counterpart of a
 * generated per-package manifest, for app developers autoloading their own js-toolkit components.
 *
 * For every `[key, importer]` in `options.modules` it derives a token from the key (see
 * {@link deriveToken}), resolves the named export matching the token (falling back to the module's
 * `default` export), and applies the option-level and per-token defaults. The loader validates that
 * the resolved value is a js-toolkit `Base` constructor and reports an error event otherwise, so no
 * validation happens here.
 *
 * This factory is pure: it never touches the DOM and never registers anything. Pass its result to
 * {@link registerManifests} (or {@link autoload}) to actually start discovery. When two module keys
 * derive the same token a `console.warn` is emitted and the later key wins.
 */
export function defineManifest(options: DefineManifestOptions): ComponentManifest {
  const overrides = options.components ?? {};
  const defaultStrategy = options.strategy ?? 'eager';
  const manifest: ComponentManifest = {};

  for (const [key, importer] of Object.entries(options.modules)) {
    const derivedToken = deriveToken(key);
    const override = overrides[derivedToken] ?? {};
    const token = override.token ?? derivedToken;
    const exportName = override.exportName ?? token;

    if (Object.prototype.hasOwnProperty.call(manifest, token)) {
      console.warn(
        `${DEFAULT_DIAGNOSTIC_PREFIX} Duplicate component token "${token}" derived from "${key}"; the later module wins.`,
      );
    }

    const entry: ComponentManifestEntry = {
      token,
      strategy: override.strategy ?? defaultStrategy,
      group: override.group ?? options.group ?? token,
      exportName,
      load: () =>
        importer().then((module) => (module[exportName] ?? module.default) as BaseConstructor),
    };

    if (options.packageName !== undefined) {
      entry.packageName = options.packageName;
    }
    if (override.children !== undefined) {
      entry.children = override.children;
    }
    if (override.styles !== undefined) {
      entry.styles = override.styles;
    }
    if (override.integrations !== undefined) {
      entry.integrations = override.integrations;
    }

    manifest[token] = entry;
  }

  return manifest;
}
