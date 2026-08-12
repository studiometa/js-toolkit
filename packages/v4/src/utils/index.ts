/**
 * The utils entry point.
 *
 * Deliberately **not** re-exported from `src/index.ts`: the root barrel is the
 * framework's surface — components, the registry, the scheduler, the services —
 * and a `clamp` beside a `Base` says nothing true about either. Utils are their
 * own entry, imported from here or from the module that holds them.
 */

export * from './maths.js';
export * from './selectors.js';
export * from './smoothTo.js';
export * from './strings.js';
