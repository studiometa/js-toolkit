import { ComponentLoader, type LoaderDependencies } from './loader.js';
import type { ComponentManifest } from './types.js';

export interface AutoloadOptions {
  /**
   * One or more manifests to compose into a single lookup table. When two manifests declare the
   * same token, the entry from the manifest that appears later in the array wins.
   */
  manifests: readonly ComponentManifest[];
  /** The DOM scope to scan and observe for `data-component` elements. Defaults to `document`. */
  root?: Document | Element;
  /** Tokens to force-load eagerly regardless of their manifest strategy or `data-load` attribute. */
  eager?: readonly string[];
  /** Loader dependency-injection seams, kept for testability. */
  dependencies?: Partial<LoaderDependencies>;
}

/** The runtime handle returned by {@link autoload}. */
export interface AutoloadHandle {
  /** The underlying loader instance. */
  loader: ComponentLoader;
  /** The composed manifest the loader was started with. */
  manifest: ComponentManifest;
  /** Stop discovery and release every scheduled trigger. */
  stop(): void;
}

/**
 * Compose several manifests into one. Later manifests take precedence over earlier ones when they
 * declare the same token, so callers can layer overrides on top of a base manifest.
 */
export function composeManifests(manifests: readonly ComponentManifest[]): ComponentManifest {
  const composed: ComponentManifest = {};
  for (const manifest of manifests) {
    for (const token of Object.keys(manifest)) {
      composed[token] = manifest[token];
    }
  }
  return composed;
}

/**
 * Start the declarative autoloader for the given manifests.
 *
 * Calling this function is the only thing that touches the DOM — importing the module does nothing
 * on its own. It composes the manifests, creates a {@link ComponentLoader}, starts discovery and
 * returns a handle that exposes the loader, the composed manifest and a `stop()` method.
 */
export function autoload(options: AutoloadOptions): AutoloadHandle {
  const manifest = composeManifests(options.manifests);
  const loader = new ComponentLoader({
    manifest,
    root: options.root,
    dependencies: options.dependencies,
  });
  loader.start({ eagerComponents: options.eager ?? [] });
  return {
    loader,
    manifest,
    stop: () => loader.stop(),
  };
}
