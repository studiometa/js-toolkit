import { lerp, map } from '../math/index.js';
import { isDefined, isFunction, isNumber, isArray } from '../is.js';
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
    progress,
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
 * @param   {NormalizedKeyframe} from
 * @param   {NormalizedKeyframe} to
 * @param   {number} progress
 * @returns {void}
 */
function render(element, from, to, progress) {
  const stepProgress = to.easing(map(progress, from.offset, to.offset, 0, 1));

  scheduler.read(function renderRead() {
    /** @type {false|number|string} */
    let opacity = false;
    if (isDefined(from.opacity) || isDefined(to.opacity)) {
      opacity = map(stepProgress, 0, 1, from.opacity ?? 1, to.opacity ?? 1);
    } else if (element.style.opacity) {
      opacity = '';
    }

    /** @type {false|string} */
    let transformOrigin = false;
    if (isDefined(to.transformOrigin)) {
      transformOrigin = to.transformOrigin;
    } else if (element.style.transformOrigin) {
      transformOrigin = '';
    }

    const props = Object.fromEntries(
      TRANSFORM_PROPS.filter((name) => isDefined(from[name]) || isDefined(to[name])).map((name) => {
        return [name, transformRenderStrategies[name](element, from[name], to[name], stepProgress)];
      }),
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
 * @typedef {import('./transform.js').TransformProps} TransformProps
 * @typedef {TransformProps & {
 *   opacity?: number;
 *   transformOrigin?: string;
 *   easing?: import('../math/createEases.js').EasingFunction|import('../tween.js').BezierCurve;
 *   offset?: number;
 * }} Keyframe
 * @typedef {Keyframe & {
 *   easing: import('../math/createEases.js').EasingFunction;
 *   offset: number;
 * }} NormalizedKeyframe
 * @typedef {{
 *   start: () => void;
 *   pause: () => void;
 *   play: () => void;
 *   finish: () => void;
 *   progress: (value?: number) => number
 * }} Animate
 */

/**
 * Animate an element.
 * @param   {HTMLElement} element
 * @param   {Keyframe[]} keyframes
 * @param   {import('../tween.js').TweenOptions} [options]
 * @returns {Animate}
 */
function singleAnimate(element, keyframes, options = {}) {
  const keyframesCount = keyframes.length - 1;
  const normalizedKeyframes = keyframes.map(
    (keyframe, index) =>
      /** @type {NormalizedKeyframe} */ ({
        ...keyframe,
        offset: keyframe.offset ?? index / keyframesCount,
        easing: normalizeEase(keyframe.easing),
      }),
  );

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
      normalizedKeyframes[toIndex] &&
      normalizedKeyframes[toIndex].offset <= progress &&
      normalizedKeyframes[toIndex].offset !== 1
    ) {
      toIndex += 1;
    }

    render(element, normalizedKeyframes[toIndex - 1], normalizedKeyframes[toIndex], progress);
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

/**
 * Animate one or more elements.
 * @param   {HTMLElement|HTMLElement[]|NodeList} elementOrElements
 * @param   {Keyframe[]} keyframes
 * @param   {import('../tween.js').TweenOptions} [options]
 * @returns {Animate}
 */
export function animate(elementOrElements, keyframes, options = {}) {
  const elements =
    isArray(elementOrElements) || elementOrElements instanceof NodeList
      ? Array.from(elementOrElements)
      : [elementOrElements];

  const controls = elements.map((element) =>
    singleAnimate(/** @type {HTMLElement} */ (element), keyframes, options)
  );

  const delegate = (key) => {
    // eslint-disable-next-line consistent-return
    return (...args) => {
      if (key === 'progress' && args.length === 0) {
        return controls[0][key]();
      }

      controls.forEach((control) => {
        control[key](...args);
      });
    };
  };

  return {
    start: delegate('start'),
    pause: delegate('pause'),
    finish: delegate('finish'),
    play: delegate('play'),
    progress: delegate('progress'),
  };
}
