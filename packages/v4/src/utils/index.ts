/** Public entry point for `@studiometa/js-toolkit-v4/utils`. */

export { isBoolean, isDefined, isFunction, isNull, isNumber, isObject, isString } from './is.js';
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
export {
  matrix,
  transform,
  TRANSFORM_PROPS,
  type MatrixProps,
  type TransformProps,
} from './transform.js';
