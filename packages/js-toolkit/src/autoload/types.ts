import type { BaseConstructor } from '../Base/Base.js';

/**
 * The load strategy that controls when a component's constructor is imported and registered.
 *
 * These four values are deliberately richer than a plain eager/lazy split: `eager` loads
 * immediately, while `visible`, `idle` and `interaction` defer the import until the matching
 * browser signal fires. A `data-load` attribute may override the default per element.
 */
export type ComponentLoadStrategy = 'eager' | 'visible' | 'idle' | 'interaction';

/**
 * A single entry of a component manifest: everything the loader needs to discover a
 * `data-component` token and load its constructor on demand.
 */
export interface ComponentManifestEntry {
  /** The `data-component` token that identifies this component in the DOM. */
  token: string;
  /**
   * The npm package the component is exported from. Optional informational metadata: the loader
   * never reads it, so hand-authored or helper-built manifests may omit it.
   */
  packageName?: string;
  /**
   * The package subpath the component is exported from. Optional informational metadata never read
   * by the loader.
   */
  subpath?: string;
  /**
   * The named export resolved by {@link ComponentManifestEntry.load}. Optional informational
   * metadata never read by the loader.
   */
  exportName?: string;
  /** The default load strategy for this component, overridable per element with `data-load`. */
  strategy: ComponentLoadStrategy;
  /**
   * A grouping key shared by every component of the same family. Optional informational metadata
   * never read by the loader.
   */
  group?: string;
  /** The tokens of the constructor's configured child components, for recursive registration. */
  children?: readonly string[];
  /** Stylesheet paths associated with this component (informational). */
  styles?: readonly string[];
  /** Optional integration keys associated with this component (informational). */
  integrations?: readonly string[];
  /** Imports and resolves the component's `Base` constructor. */
  load: () => Promise<BaseConstructor>;
}

/** A map of `data-component` tokens to their manifest entries. */
export type ComponentManifest = Record<string, ComponentManifestEntry>;
