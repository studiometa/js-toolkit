/** Public entry point for `@studiometa/js-toolkit-v4/utils`. */

export { deepmerge } from './deepmerge.js';
export {
  createElement,
  getOffsetSizes,
  type CreateElementAttributes,
  type CreateElementChildren,
  type OffsetSizes,
} from './dom.js';
export {
  createEaseInOut,
  createEaseOut,
  easeInCirc,
  easeInCubic,
  easeInExpo,
  easeInOutCirc,
  easeInOutCubic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutQuint,
  easeInOutSine,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  easeLinear,
  easeOutCirc,
  easeOutCubic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutQuint,
  easeOutSine,
  type EasingFunction,
} from './easings.js';
export { saveActiveElement, trapFocus, untrapFocus } from './focus.js';
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
  createRange,
  damp,
  decayOver,
  DEFAULT_DAMP_FACTOR,
  fold,
  inertiaDecay,
  inertiaFinalValue,
  inertiaStep,
  inertiaTimeConstant,
  INERTIA_FRAME,
  lerp,
  map,
  MAX_SPRING_RATIO,
  mean,
  round,
  spring,
  wrap,
  type SpringOptions,
} from './maths.js';
export { memo, type Memo } from './memo.js';
export { random, randomInt, randomItem } from './random.js';
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
  enterTransition,
  leaveTransition,
  setClassesOrStyles,
  transition,
  TRANSITION_OPTIONS,
  type ClassesOrStyles,
  type TransitionOptions,
  type TransitionStyles,
} from './transition.js';
export {
  matrix,
  transform,
  TRANSFORM_PROPS,
  type MatrixProps,
  type TransformProps,
} from './transform.js';
