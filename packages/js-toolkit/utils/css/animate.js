import { lerp, map } from '../math/index.js';
import { isDefined, isFunction, isNumber } from '../is.js';
import transform, { TRANSFORM_PROPS } from './transform.js';
import { domScheduler as scheduler } from '../scheduler.js';
import { tween, normalizeEase } from '../tween.js';

let id = 0;
const running = new WeakMap();

const CSSUnitConverter = {
  '%': (value, getSizeRef) => (value * getSizeRef()) / 100,
  vh: (value) => (value * window.innerHeight) / 100,
  vw: (value) => (value * window.innerWidth) / 100,
  vmin: (value) => (value * Math.min(window.innerWidth, window.innerHeight)) / 100,
  vmax: (value) => (value * Math.max(window.innerWidth, window.innerHeight)) / 100,
};

/**
 * Get the value from a step property.
 * @param   {number|[number, string]} val
 * @param   {() => number} getSizeRef
 * @returns {number}
 */
function getAnimationStepValue(val, getSizeRef) {
  if (isNumber(val)) {
    return val;
  }

  if (!val[1] || !CSSUnitConverter[val[1]]) {
    return val[0];
  }

  return CSSUnitConverter[val[1]](val[0], getSizeRef);
}

const generateTranslateRenderStrategy = (sizeRef) => (element, fromValue, toValue, progress) =>
  lerp(
    getAnimationStepValue(fromValue ?? 0, () => element[sizeRef]),
    getAnimationStepValue(toValue ?? 0, () => element[sizeRef]),
    progress
  );
const widthBasedTranslateRenderStrategy = generateTranslateRenderStrategy('offsetWidth');
const heightBasedTranslateRenderStrategy = generateTranslateRenderStrategy('offsetHeight');

const generateLerpRenderStrategy = (defaultValue) => (element, fromValue, toValue, progress) =>
  lerp(fromValue ?? defaultValue, toValue ?? defaultValue, progress);
const scaleRenderStrategy = generateLerpRenderStrategy(1);
const degreesRenderStrategy = generateLerpRenderStrategy(0);

const transformRenderStrategies = {
  x: widthBasedTranslateRenderStrategy,
  y: heightBasedTranslateRenderStrategy,
  z: widthBasedTranslateRenderStrategy,
  scale: scaleRenderStrategy,
  scaleX: scaleRenderStrategy,
  scaleY: scaleRenderStrategy,
  scaleZ: scaleRenderStrategy,
  skew: degreesRenderStrategy,
  skewX: degreesRenderStrategy,
  skewY: degreesRenderStrategy,
  rotate: degreesRenderStrategy,
  rotateX: degreesRenderStrategy,
  rotateY: degreesRenderStrategy,
  rotateZ: degreesRenderStrategy,
};

/**
 * Render an element style based on 2 keyframes and a progress value.
 *
 * @param   {HTMLElement} element
 * @param   {NormalizedKeyframe} keyframe
 * @param   {number} fromIndex
 * @param   {number} toIndex
 * @param   {number} progress
 * @returns {void}
 */
function render(element, keyframe, fromIndex, toIndex, progress) {
  const stepProgress = keyframe.easing[toIndex](
    map(progress, keyframe.offset[fromIndex], keyframe.offset[toIndex], 0, 1)
  );

  scheduler.read(function renderRead() {
    /** @type {false|number|string} */
    let opacity = false;
    if (isDefined(keyframe[fromIndex]?.opacity) || isDefined(keyframe[toIndex]?.opacity)) {
      opacity = map(
        stepProgress,
        0,
        1,
        keyframe[fromIndex].opacity ?? 1,
        keyframe[toIndex].opacity ?? 1
      );
    } else if (element.style.opacity) {
      opacity = '';
    }

    /** @type {false|string} */
    let transformOrigin = false;
    if (isDefined(keyframe[toIndex]?.transformOrigin)) {
      transformOrigin = keyframe[toIndex].transformOrigin;
    } else if (element.style.transformOrigin) {
      transformOrigin = '';
    }

    const props = Object.fromEntries(
      TRANSFORM_PROPS.filter(
        (name) => isDefined(keyframe[name]?.[fromIndex]) || isDefined(keyframe[name]?.[toIndex])
      ).map((name) => {
        return [
          name,
          transformRenderStrategies[name](
            element,
            keyframe[name][fromIndex],
            keyframe[name][toIndex],
            stepProgress
          ),
        ];
      })
    );

    scheduler.write(function renderWrite() {
      if (opacity !== false) {
        // @ts-ignore
        element.style.opacity = opacity;
      }
      if (transformOrigin !== false) {
        element.style.transformOrigin = transformOrigin;
      }
      transform(element, props);
    });
  });
}

/**
 * @template Type
 * @typedef {{
 *   [Property in keyof Type]: Array<null|Type[Property]>;
 * }} MapTypeToArray
 */

/**
 * @typedef {import('./transform.js').TransformProps} TransformProps
 * @typedef {TransformProps & {
 *   opacity?: number;
 *   transformOrigin?: string;
 *   easing?: import('../math/createEases.js').EasingFunction|import('../tween.js').BezierCurve;
 *   offset?: number;
 * }} SingleKeyframe
 * @typedef {MapTypeToArray<SingleKeyframe & {
 *   easing: import('../math/createEases.js').EasingFunction;
 *   offset: number;
 * }>} NormalizedKeyframe
 * @typedef {{
 *   start: () => void;
 *   pause: () => void;
 *   play: () => void;
 *   finish: () => void;
 *   progress: (value: number?) => number
 * }} Animate
 */

/**
 * Normalize keyframes to the object format.
 * @param   {SingleKeyframe[] | NormalizedKeyframe} keyframes [description]
 * @returns {NormalizedKeyframe}
 */
function normalizeKeyframesFormat(keyframes) {
  if (!Array.isArray(keyframes)) {
    return keyframes;
  }

  const keyframesCount = keyframes.length - 1;
  const keys = Array.from(new Set(keyframes.flatMap((keyframe) => Object.keys(keyframe))));
  const normalized = /** @type {NormalizedKeyframe} */ (
    Object.fromEntries(keys.map((key) => [key, []]))
  );
  normalized.offset = [];
  normalized.easing = [];

  keyframes.forEach((keyframe, index) => {
    keys.forEach((key) => {
      normalized[key][index] = keyframe[key] ?? null;
    });
    normalized.offset[index] = keyframe.offset ?? index / keyframesCount;
    normalized.easing[index] = normalizeEase(keyframe.easing);
  });

  return normalized;
}

/**
 * Animate an element.
 * @param   {HTMLElement} element
 * @param   {SingleKeyframe[] | NormalizedKeyframe} keyframes
 * @param   {import('../tween.js').TweenOptions} [options]
 * @returns {Animate}
 */
export function animate(element, keyframes, options = {}) {
  const normalizedKeyframes = normalizeKeyframesFormat(keyframes);

  if (!running.has(element)) {
    running.set(element, new Map());
  }

  const key = `animate-${id}`;
  id += 1;

  /**
   * Set the progress value.
   *
   * @param {number} progress The progress value.
   */
  function callback(progress) {
    let toIndex = 0;
    while (
      normalizedKeyframes.offset[toIndex] <= progress &&
      normalizedKeyframes.offset[toIndex] !== 1
    ) {
      toIndex += 1;
    }

    render(element, normalizedKeyframes, toIndex - 1, toIndex, progress);
  }

  const controls = tween(callback, {
    ...options,
    onStart() {
      if (isFunction(options.onStart)) {
        options.onStart();
      }
      // Stop running instances
      const runningKeys = running.get(element);
      runningKeys.forEach((runningPause, runningKey) => {
        runningPause();
        runningKeys.delete(runningKey);
      });
      runningKeys.set(key, controls.pause);
      running.set(element, runningKeys);
    },
  });

  return controls;
}
