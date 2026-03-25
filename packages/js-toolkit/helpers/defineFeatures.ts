import type { Features } from '../Base/features.js';
import { features } from '../Base/features.js';
import { isBoolean, isObject, isString } from '../utils/index.js';

/**
 * Configure global features outside of `createApp`.
 * Useful when using `registerComponent` instead of `createApp`.
 * @link https://js-toolkit.studiometa.dev/api/helpers/defineFeatures.html
 */
export function defineFeatures(options: Partial<Features>): void {
  const { breakpoints, blocking, prefix, attributes } = options;

  if (isObject(breakpoints)) {
    features.set('breakpoints', breakpoints);
  }

  if (isBoolean(blocking)) {
    features.set('blocking', blocking);
  }

  if (isString(prefix)) {
    features.set('prefix', prefix);
  }

  if (isObject(attributes)) {
    features.set('attributes', attributes);
  }
}
