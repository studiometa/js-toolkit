import { clamp01, lerp, map } from '../math/index.js';
import { isFunction, isNumber } from '../is.js';
import { domScheduler as scheduler } from '../scheduler.js';
import { tween, normalizeEase } from '../tween.js';
import { eachElements } from './utils.js';
import { startsWith } from '../string/index.js';
import type { TransformProps } from './transform.js';
import type { EasingFunction } from '../math/index.js';
import type { BezierCurve, Tween, TweenOptions } from '../tween.js';

export type CSSCustomPropertyName = `--${string}`;

type KeyframeTransforms<Type> = {
  [Property in keyof Type]: number | [number, string];
};

export type Keyframe = Partial<
  KeyframeTransforms<TransformProps> & {
    opacity: number;
    transformOrigin: string;
    easing: EasingFunction | BezierCurve;
    offset: number;
    [key: CSSCustomPropertyName]: number;
  }
>;

export type NormalizedKeyframe = Keyframe & {
  easing: EasingFunction;
  offset: number;
  vars: string[];
};


/**
 * A pre-compiled segment between two keyframes.
 * All constant parts (deltas, offsets, writers) are resolved once at creation.
 * The render loop only does multiply-add and string concatenation.
 */
interface CompiledSegment {
  fromOffset: number;
  toOffset: number;
  easing: EasingFunction;
  /** Parallel arrays for transform properties (structure-of-arrays layout) */
  transformStarts: number[];
  transformDeltas: number[];
  transformCssFunctions: string[];
  transformUnits: string[];
  /** Whether translate3d is needed */
  hasTranslate: boolean;
  /** Indices into transformStarts/transformDeltas for x, y, z axes */
  translateAxisIndices: number[];
  /** The index where non-translate transforms start in the parallel arrays */
  simpleTransformStart: number;
  /** Translate properties that need element size for CSS unit conversion at render time */
  dynamicTranslates: Array<{
    index: number;
    from: number | [number, string];
    to: number | [number, string];
    sizeRef: string;
  }>;
  /** Opacity: pre-computed start and delta, or null if not animated */
  opacityStart: number;
  opacityDelta: number;
  hasOpacity: boolean;
  /** CSS custom properties: parallel arrays */
  customPropertyNames: string[];
  customPropertyStarts: number[];
  customPropertyDeltas: number[];
  /** Transform origin for this segment, or false */
  transformOrigin: string | false;
}

export interface AnimateOptions extends Omit<TweenOptions, 'duration'> {
  /**
   * The duration of the tween, in seconds.
   * When using multiple targets, it can be a function which will be
   * called with the current target and its index and should return
   * the duration in seconds for this element.
   *
   * Defaults to `1`.
   */
  duration?: number | ((target: HTMLElement, index: number) => number);
  /**
   * Delay between the start of each target animation, in seconds.
   * When using multiple targets, it can be a function which will be called
   * with the current target and its index and should return the delay
   * in seconds for this element's tween.
   *
   * Defaults to `0`.
   */
  stagger?: number | ((target: HTMLElement, index: number) => number);
}

export type Animate = Tween;

let id = 0;
const running = new WeakMap();

const CSSUnitConverter = {
  '%': (value: number, size: number) => (value * size) / 100,
  vh: (value: number) => (value * window.innerHeight) / 100,
  vw: (value: number) => (value * window.innerWidth) / 100,
  vmin: (value: number) => (value * Math.min(window.innerWidth, window.innerHeight)) / 100,
  vmax: (value: number) => (value * Math.max(window.innerWidth, window.innerHeight)) / 100,
};

/**
 * Resolve a keyframe value that may have a CSS unit (e.g. [50, '%']).
 */
function resolveUnitValue(val: number | [number, string], elementSize: number): number {
  if (typeof val === 'number') {
    return val;
  }

  if (!val[1] || !CSSUnitConverter[val[1]]) {
    return val[0];
  }

  return CSSUnitConverter[val[1]](val[0], elementSize);
}

/**
 * Non-translate transform property definitions: [keyframeProp, cssFn, unit, defaultValue].
 */
const SIMPLE_TRANSFORM_DEFS: ReadonlyArray<
  readonly [string, string, string, number]
> = [
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

/**
 * Translate axis definitions: [keyframeProp, defaultValue, sizeRef].
 * These are grouped into a single translate3d() call during rendering.
 */
const TRANSLATE_DEFS: ReadonlyArray<
  readonly [string, number, string]
> = [
  ['x', 0, 'offsetWidth'],
  ['y', 0, 'offsetHeight'],
  ['z', 0, 'offsetWidth'],
];

/**
 * Compile a pair of keyframes into a pre-computed segment.
 * All constant work (deltas, property filtering) is done here once.
 */
function compileSegment(
  from: NormalizedKeyframe,
  to: NormalizedKeyframe,
): CompiledSegment {
  const transformStarts: number[] = [];
  const transformDeltas: number[] = [];
  const transformCssFunctions: string[] = [];
  const transformUnits: string[] = [];
  const dynamicTranslates: CompiledSegment['dynamicTranslates'] = [];

  // Translate axes: grouped into translate3d(x, y, z) during rendering.
  // We track indices into the parallel arrays for x, y, z.
  let hasTranslate = false;
  const translateAxisIndices: number[] = [];

  for (const [prop, defaultValue, sizeRef] of TRANSLATE_DEFS) {
    const propertyExists = from[prop] !== undefined || to[prop] !== undefined;
    if (propertyExists) hasTranslate = true;

    const fromValue = from[prop] ?? defaultValue;
    const toValue = to[prop] ?? defaultValue;
    const arrayIndex = transformStarts.length;
    translateAxisIndices.push(arrayIndex);

    // Placeholder CSS function/unit — not used for translate (special rendering)
    transformCssFunctions.push('');
    transformUnits.push('px');

    if (typeof fromValue !== 'number' || typeof toValue !== 'number') {
      transformStarts.push(0);
      transformDeltas.push(0);
      dynamicTranslates.push({ index: arrayIndex, from: fromValue, to: toValue, sizeRef });
    } else {
      transformStarts.push(fromValue);
      transformDeltas.push(toValue - fromValue);
    }
  }

  // Non-translate transforms: each gets its own CSS function
  for (const [prop, cssFunction, unit, defaultValue] of SIMPLE_TRANSFORM_DEFS) {
    if (from[prop] === undefined && to[prop] === undefined) continue;

    const startValue = (from[prop] as number) ?? defaultValue;
    transformCssFunctions.push(cssFunction);
    transformUnits.push(unit);
    transformStarts.push(startValue);
    transformDeltas.push(((to[prop] as number) ?? defaultValue) - startValue);
  }

  // Opacity
  const hasOpacity = from.opacity !== undefined || to.opacity !== undefined;
  const opacityStart = hasOpacity ? (from.opacity ?? 1) : 0;
  const opacityDelta = hasOpacity ? (to.opacity ?? 1) - opacityStart : 0;

  // CSS custom properties
  const customPropertyNames: string[] = [];
  const customPropertyStarts: number[] = [];
  const customPropertyDeltas: number[] = [];
  if (from.vars && to.vars) {
    for (const name of from.vars) {
      const startValue = from[name] as number;
      const endValue = (to[name] as number | undefined) ?? startValue;
      customPropertyNames.push(name);
      customPropertyStarts.push(startValue);
      customPropertyDeltas.push(endValue - startValue);
    }
  }

  return {
    fromOffset: from.offset,
    toOffset: to.offset,
    easing: to.easing,
    transformStarts,
    transformDeltas,
    transformCssFunctions,
    transformUnits,
    hasTranslate,
    translateAxisIndices,
    simpleTransformStart: TRANSLATE_DEFS.length,
    dynamicTranslates,
    hasOpacity,
    opacityStart,
    opacityDelta,
    customPropertyNames,
    customPropertyStarts,
    customPropertyDeltas,
    transformOrigin: to.transformOrigin !== undefined ? to.transformOrigin : false,
  };
}

/**
 * Render an element using a pre-compiled segment and a progress value.
 * The hot path: only multiply-add, string concatenation, and DOM writes.
 */
function renderSegment(
  element: HTMLElement,
  segment: CompiledSegment,
  progress: number,
) {
  const easedProgress = segment.easing(
    map(progress, segment.fromOffset, segment.toOffset, 0, 1),
  );

  scheduler.read(() => {
    // Resolve dynamic (CSS-unit) transforms that need element size
    for (let i = 0; i < segment.dynamicTranslates.length; i++) {
      const dynamic = segment.dynamicTranslates[i];
      const elementSize = element[dynamic.sizeRef];
      const startValue = resolveUnitValue(dynamic.from, elementSize);
      segment.transformStarts[dynamic.index] = startValue;
      segment.transformDeltas[dynamic.index] = resolveUnitValue(dynamic.to, elementSize) - startValue;
    }

    // Build transform string: translate3d grouped, then individual transforms
    let transformValue = '';

    if (segment.hasTranslate) {
      const xIndex = segment.translateAxisIndices[0];
      const yIndex = segment.translateAxisIndices[1];
      const zIndex = segment.translateAxisIndices[2];
      const x = segment.transformStarts[xIndex] + segment.transformDeltas[xIndex] * easedProgress;
      const y = segment.transformStarts[yIndex] + segment.transformDeltas[yIndex] * easedProgress;
      const z = segment.transformStarts[zIndex] + segment.transformDeltas[zIndex] * easedProgress;
      transformValue += `translate3d(${x}px, ${y}px, ${z}px) `;
    }

    for (let i = segment.simpleTransformStart; i < segment.transformStarts.length; i++) {
      const value = segment.transformStarts[i] + segment.transformDeltas[i] * easedProgress;
      transformValue += `${segment.transformCssFunctions[i]}(${value}${segment.transformUnits[i]}) `;
    }

    // Compute opacity
    let opacity: false | number | string = false;
    if (segment.hasOpacity) {
      opacity = segment.opacityStart + segment.opacityDelta * easedProgress;
    } else if (element.style.opacity) {
      opacity = '';
    }

    // Compute CSS custom properties
    const hasCustomProperties = segment.customPropertyNames.length > 0;

    scheduler.write(() => {
      if (opacity !== false) {
        // @ts-ignore
        element.style.opacity = opacity;
      }
      if (segment.transformOrigin !== false) {
        element.style.transformOrigin = segment.transformOrigin;
      } else if (element.style.transformOrigin) {
        element.style.transformOrigin = '';
      }
      if (hasCustomProperties) {
        for (let i = 0; i < segment.customPropertyNames.length; i++) {
          element.style.setProperty(
            segment.customPropertyNames[i],
            (segment.customPropertyStarts[i] + segment.customPropertyDeltas[i] * easedProgress).toString(),
          );
        }
      }
      element.style.transform = transformValue;
    });
  });
}

/**
 * Animate an element.
 */
function singleAnimate(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: TweenOptions = {},
): Animate {
  const keyframesCount = keyframes.length - 1;
  const normalizedKeyframes = keyframes.map(
    (keyframe, index): NormalizedKeyframe => ({
      ...keyframe,
      offset: keyframe.offset ?? index / keyframesCount,
      easing: normalizeEase(keyframe.easing),
      vars: Object.keys(keyframe).filter((key) => startsWith(key, '--')),
    }),
  );

  // Compile keyframe pairs into pre-computed segments (stage 1: partial evaluation)
  const segments: CompiledSegment[] = [];
  for (let i = 1; i < normalizedKeyframes.length; i++) {
    segments.push(compileSegment(normalizedKeyframes[i - 1], normalizedKeyframes[i]));
  }

  if (!running.has(element)) {
    running.set(element, new Map());
  }

  const key = `animate-${id}`;
  id += 1;

  /**
   * Set the progress value.
   */
  function callback(progress: number) {
    let segmentIndex = 0;
    while (
      segmentIndex < segments.length - 1 &&
      segments[segmentIndex].toOffset <= progress &&
      segments[segmentIndex].toOffset !== 1
    ) {
      segmentIndex += 1;
    }

    renderSegment(element, segments[segmentIndex], progress);
  }

  const controls = tween(callback, {
    ...options,
    onStart(progress) {
      if (isFunction(options.onStart)) {
        options.onStart(progress);
      }
      // Stop running instances
      const runningKeys = running.get(element);
      for (const [runningKey, runningPause] of runningKeys.entries()) {
        runningPause();
        runningKeys.delete(runningKey);
      }
      runningKeys.set(key, controls.pause);
      running.set(element, runningKeys);
    },
  });

  return controls;
}

type Duration = number;
type Delay = number;
type DurationWithDelay = number;

/**
 * Animate one or more elements.
 * @link https://js-toolkit.studiometa.dev/utils/css/animate.html
*/
export function animate(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  keyframes: Keyframe[],
  options: AnimateOptions = {},
): Animate {
  if (elementOrElements instanceof HTMLElement) {
    return singleAnimate(elementOrElements, keyframes, {
      ...options,
      duration: isFunction(options.duration)
        ? options.duration(elementOrElements, 0)
        : options.duration,
    });
  }

  const stagger = options.stagger ?? 0;
  const staggerIsFunction = isFunction(stagger);
  const durationFn = isFunction(options.duration) ? options.duration : null;
  const progressFn = isFunction(options.onProgress) ? options.onProgress : null;
  const progresses: number[] = [];
  const timings: [Duration, Delay, DurationWithDelay][] = [];
  let duration = 0;
  let progressSum = 0;
  let elementCount = 0;

  const controls = eachElements(elementOrElements, (element, index) => {
    const delay = staggerIsFunction ? stagger(element, index) : stagger * index;
    const itemOptions = { ...options, delay } as TweenOptions;

    if (durationFn) {
      itemOptions.duration = durationFn(element, index);
    } else if (itemOptions.duration === undefined) {
      itemOptions.duration = 1;
    }

    timings[index] = [itemOptions.duration, delay, itemOptions.duration + delay];

    if (timings[index][2] > duration) {
      // eslint-disable-next-line prefer-destructuring
      duration = timings[index][2];
    }

    progresses[index] = 0;
    elementCount = index + 1;
    itemOptions.onProgress = (itemProgress) => {
      progressSum += itemProgress - progresses[index];
      progresses[index] = itemProgress;
      if (progressFn) {
        progressFn(progressSum / elementCount);
      }
    };

    return singleAnimate(element, keyframes, itemOptions);
  });

  function forAll(key: string) {
    for (const control of controls) {
      control[key]();
    }
  }

  function progress(newProgress?: number) {
    if (newProgress !== undefined) {
      const newTime = lerp(0, duration, newProgress);
      for (let i = 0; i < controls.length; i++) {
        const controlProgress = clamp01(
          map(newTime, timings[i][1], timings[i][2], 0, 1),
        );
        controls[i].progress(controlProgress);
      }
    }

    return progressSum / elementCount;
  }

  return {
    start: () => forAll('start'),
    pause: () => forAll('pause'),
    finish: () => forAll('finish'),
    play: () => forAll('play'),
    progress,
  };
}
