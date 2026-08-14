/**
 * The utils entry point — `@studiometa/js-toolkit-v4/utils`.
 *
 * Deliberately **not** re-exported from `src/index.ts`: the root barrel is the
 * framework's surface — components, the registry, the scheduler, the services —
 * and a `clamp` beside a `Base` says nothing true about either. Utils are their
 * own entry, imported from here or from the module that holds them.
 *
 * Every export is named rather than star-forwarded, so this file is a readable
 * inventory of the surface and adding to a module is a deliberate act here
 * rather than a side effect there.
 */

export {
  clamp,
  clamp01,
  clampDampFactor,
  damp,
  decayOver,
  DEFAULT_DAMP_FACTOR,
  inertiaDecay,
  inertiaFinalValue,
  inertiaStep,
  inertiaTimeConstant,
  INERTIA_FRAME,
  lerp,
  map,
  MAX_SPRING_RATIO,
  spring,
  type SpringOptions,
} from './maths.js';
export { memo, type Memo } from './memo.js';
export { selectorFor } from './selectors.js';
export { smoothTo, type SmoothTo, type SmoothToOptions } from './smoothTo.js';
export { kebabCase, pascalCase } from './strings.js';
