import debounce from './debounce.js';
import focusTrap from './focusTrap.js';
import keyCodes from './keyCodes.js';
import memoize from './memoize.js';
import nextFrame from './nextFrame.js';
import throttle from './throttle.js';
import { matrix, transition } from './css/index.js';
import {
  collidePointRect,
  collideRectRect,
  boundingRectToCircle,
  collideCircleRect,
  collideCircleCircle,
  collidePointCircle,
} from './collide/index.js';
import {
  objectToURLSearchParams,
  push as historyPush,
  replace as historyReplace,
} from './history.js';
import { clamp, clamp01, damp, inertiaFinalValue, lerp, map, round } from './math/index.js';
import {
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
} from './string/index.js';

// css
export { matrix, transition };

// collide
export {
  collidePointRect,
  collideRectRect,
  boundingRectToCircle,
  collideCircleRect,
  collideCircleCircle,
  collidePointCircle,
};

// history
export { objectToURLSearchParams, historyPush, historyReplace };

// math
export { clamp, clamp01, damp, inertiaFinalValue, lerp, map, round };

// string
export {
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
};

export { debounce, focusTrap, keyCodes, memoize, nextFrame, throttle };
