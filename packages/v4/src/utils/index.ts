/** Public entry point for `@studiometa/js-toolkit-v4/utils`. */

export { createElement, type CreateElementAttributes, type CreateElementChildren } from './dom.js';
export {
  historyPush,
  historyReplace,
  objectToURLSearchParams,
  type HistoryOptions,
  type SearchParamInput,
} from './history.js';
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
export {
  camelCase,
  capitalize,
  kebabCase,
  lowerCase,
  pascalCase,
  snakeCase,
  upperCase,
  withLeadingCharacters,
  withLeadingSlash,
  withoutLeadingCharacters,
  withoutLeadingCharactersRecursive,
  withoutLeadingSlash,
  withoutTrailingCharacters,
  withoutTrailingCharactersRecursive,
  withoutTrailingSlash,
  withTrailingCharacters,
  withTrailingSlash,
} from './strings.js';
export { debounce, throttle, wait } from './timing.js';
export {
  matrix,
  transform,
  TRANSFORM_PROPS,
  type MatrixProps,
  type TransformProps,
} from './transform.js';
