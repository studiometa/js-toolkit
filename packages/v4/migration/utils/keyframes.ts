import { clamp01, map } from '../../src/utils/maths.js';
import { normalizeEasing, type BezierCurve, type EasingFunction } from './easings.js';

/** Pure keyframe-to-style interpolation for scroll animations. */

export type CSSCustomPropertyName = `--${string}`;

/** A length that may carry a CSS unit, e.g. `[50, '%']`. */
export type UnitValue = number | [number, string];

export interface Keyframe {
  x?: UnitValue;
  y?: UnitValue;
  z?: UnitValue;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  skew?: number;
  skewX?: number;
  skewY?: number;
  opacity?: number;
  transformOrigin?: string;
  easing?: EasingFunction | BezierCurve;
  offset?: number;
  [key: CSSCustomPropertyName]: unknown;
}

/** What the interpolator produces: a style patch, not a DOM write. */
export interface KeyframeStyles {
  transform: string;
  opacity: string;
  transformOrigin: string;
  customProperties: Array<[string, string]>;
}

/** The element size the `%` unit resolves against. */
export interface ElementSize {
  width: number;
  height: number;
}

interface NormalizedKeyframe extends Keyframe {
  offset: number;
  ease: EasingFunction;
  vars: string[];
}

/** `[keyframe property, css function, unit, default value]`. */
const SIMPLE_TRANSFORMS: ReadonlyArray<readonly [keyof Keyframe, string, string, number]> = [
  ['rotate', 'rotate', 'deg', 0],
  ['rotateX', 'rotateX', 'deg', 0],
  ['rotateY', 'rotateY', 'deg', 0],
  ['rotateZ', 'rotateZ', 'deg', 0],
  ['scale', 'scale', '', 1],
  ['scaleX', 'scaleX', '', 1],
  ['scaleY', 'scaleY', '', 1],
  ['scaleZ', 'scaleZ', '', 1],
  ['skew', 'skew', 'deg', 0],
  ['skewX', 'skewX', 'deg', 0],
  ['skewY', 'skewY', 'deg', 0],
];

/** `[keyframe property, size axis]` — grouped into one `translate3d()`. */
const TRANSLATES: ReadonlyArray<readonly ['x' | 'y' | 'z', keyof ElementSize]> = [
  ['x', 'width'],
  ['y', 'height'],
  ['z', 'width'],
];

const UNIT_CONVERTERS: Record<string, (value: number, size: number) => number> = {
  '%': (value, size) => (value * size) / 100,
  vh: (value) => (value * window.innerHeight) / 100,
  vw: (value) => (value * window.innerWidth) / 100,
  vmin: (value) => (value * Math.min(window.innerWidth, window.innerHeight)) / 100,
  vmax: (value) => (value * Math.max(window.innerWidth, window.innerHeight)) / 100,
};

function resolveUnit(value: UnitValue | undefined, fallback: number, size: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value === 'number') {
    return value;
  }
  const converter = UNIT_CONVERTERS[value[1]];
  return converter ? converter(value[0], size) : value[0];
}

function normalize(keyframes: Keyframe[], easing?: EasingFunction | BezierCurve) {
  const last = Math.max(1, keyframes.length - 1);
  return keyframes.map((keyframe, index): NormalizedKeyframe => ({
    ...keyframe,
    offset: keyframe.offset ?? index / last,
    ease: normalizeEasing(keyframe.easing ?? easing),
    vars: Object.keys(keyframe).filter((key) => key.startsWith('--')),
  }));
}

/**
 * Compile a keyframe list into the pure function that reads it.
 *
 * @returns `(progress, size) => KeyframeStyles`, where `size` resolves the
 *   `%` unit of the translate axes.
 */
export function compile(
  keyframes: Keyframe[],
  { easing }: { easing?: EasingFunction | BezierCurve } = {},
): (progress: number, size: ElementSize) => KeyframeStyles {
  const normalized = normalize(keyframes, easing);

  return (progress: number, size: ElementSize): KeyframeStyles => {
    const styles: KeyframeStyles = {
      transform: '',
      opacity: '',
      transformOrigin: '',
      customProperties: [],
    };

    if (normalized.length < 2) {
      return styles;
    }

    // The segment the progress falls in, the last one included.
    let index = 1;
    while (index < normalized.length - 1 && normalized[index].offset <= progress) {
      index += 1;
    }
    const from = normalized[index - 1];
    const to = normalized[index];
    const local = to.ease(clamp01(map(progress, from.offset, to.offset, 0, 1)));

    let transform = '';
    let hasTranslate = false;
    const translated = TRANSLATES.map(([axis, sizeKey]) => {
      if (from[axis] !== undefined || to[axis] !== undefined) {
        hasTranslate = true;
      }
      const start = resolveUnit(from[axis], 0, size[sizeKey]);
      const end = resolveUnit(to[axis], 0, size[sizeKey]);
      return start + (end - start) * local;
    });
    if (hasTranslate) {
      transform += `translate3d(${translated[0]}px, ${translated[1]}px, ${translated[2]}px) `;
    }

    for (const [property, cssFunction, unit, defaultValue] of SIMPLE_TRANSFORMS) {
      if (from[property] === undefined && to[property] === undefined) {
        continue;
      }
      const start = (from[property] as number | undefined) ?? defaultValue;
      const end = (to[property] as number | undefined) ?? defaultValue;
      transform += `${cssFunction}(${start + (end - start) * local}${unit}) `;
    }
    styles.transform = transform.trimEnd();

    if (from.opacity !== undefined || to.opacity !== undefined) {
      const start = from.opacity ?? 1;
      const end = to.opacity ?? 1;
      styles.opacity = String(start + (end - start) * local);
    }

    if (to.transformOrigin !== undefined) {
      styles.transformOrigin = to.transformOrigin;
    }

    for (const name of from.vars) {
      const start = from[name as CSSCustomPropertyName] as number;
      const end = (to[name as CSSCustomPropertyName] as number | undefined) ?? start;
      styles.customProperties.push([name, String(start + (end - start) * local)]);
    }

    return styles;
  };
}

/**
 * Apply a style patch. Meant to be called from the scheduler's `write`
 * phase — it does no scheduling of its own.
 */
export function applyStyles(el: HTMLElement, styles: KeyframeStyles): void {
  el.style.transform = styles.transform;
  el.style.opacity = styles.opacity;
  el.style.transformOrigin = styles.transformOrigin;
  for (const [name, value] of styles.customProperties) {
    el.style.setProperty(name, value);
  }
}
