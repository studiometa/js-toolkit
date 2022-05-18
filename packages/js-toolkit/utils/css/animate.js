import { cubicBezier } from '@motionone/easing';
import { lerp, map, clamp01 } from '../math/index.js';
import isDefined from '../isDefined.js';
import transform, { TRANSFORM_PROPS } from './transform.js';
import useRaf from '../../services/raf.js';
import { useScheduler } from '../scheduler.js';

const raf = useRaf();
const scheduler = useScheduler(['read', 'write']);

let id = 0;
const running = new WeakMap();

const noop = () => {};

const PROGRESS_PRECISION = 0.0001;

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
  if (typeof val === 'number') {
    return val;
  }

  if (!val[1] || !CSSUnitConverter[val[1]]) {
    return val[0];
  }

  return CSSUnitConverter[val[1]](val[0], getSizeRef);
}

/**
 * Linear easing.
 *
 * @template {number} T
 * @param   {T} value
 * @returns {T}
 */
function linear(value) {
  return value;
}

/**
 * Normalize a easing function with default fallbacks.
 * @param   {((p:number) => number)|[number,number,number,number]} ease
 * @returns {(p:number) => number}
 */
function normalizeEase(ease) {
  if (!isDefined(ease)) {
    return linear;
  }

  if (Array.isArray(ease)) {
    return cubicBezier(...ease);
  }

  return ease;
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
 * @param   {NormalizedKeyframe} from
 * @param   {NormalizedKeyframe} to
 * @param   {number} progress
 * @returns {void}
 */
function render(element, from, to, progress) {
  const stepProgress = to.easing(map(progress, from.offset, to.offset, 0, 1));

  scheduler.read(function read() {
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
      })
    );
    scheduler.write(function write() {
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
 * @typedef {import('../math/ease.js').EasingFunction} EasingFn
 * @typedef {[number, number, number, number]} BezierCurve
 * @typedef {{
 *   duration?: number;
 *   easing?: EasingFn|BezierCurve;
 *   onProgress?: (progress: number, easedProgress: number) => void;
 *   onFinish?: (progress: number, easedProgress: number) => void;
 *  }} Options
 * @typedef {TransformProps & {
 *   opacity?: number;
 *   transformOrigin?: string;
 *   easing?: EasingFn|BezierCurve;
 *   offset?: number;
 * }} Keyframe
 * @typedef {Keyframe & {
 *   easing: EasingFn;
 *   offset: number;
 * }} NormalizedKeyframe
 * @typedef {{
 *   start: () => void;
 *   pause: () => void;
 *   play: () => void;
 *   finish: () => void;
 *   progress: (value: number?) => number
 * }} Animate
 */

/**
 * Animate an element.
 * @param   {HTMLElement} element
 * @param   {Keyframe[]} keyframes
 * @param   {Options} options
 * @returns {Animate}
 */
export function animate(element, keyframes, options = {}) {
  let progressValue = 0;
  let easedProgress = 0;

  if (!running.has(element)) {
    running.set(element, new Map());
  }

  const ease = normalizeEase(options.easing);
  let duration = options.duration ?? 1;
  duration *= 1000;

  let startTime = performance.now();
  let endTime = startTime + duration;

  const key = `animate-${id}`;
  id += 1;

  const { onProgress = noop, onFinish = noop } = options;
  let isRunning = false;

  const keyframesCount = keyframes.length - 1;
  const normalizedKeyframes = keyframes.map(
    (keyframe, index) =>
      /** @type {NormalizedKeyframe} */ ({
        ...keyframe,
        offset: keyframe.offset ?? index / keyframesCount,
        easing: normalizeEase(keyframe.easing),
      })
  );

  /**
   * Pause the animation.
   *
   * @returns {void}
   */
  function pause() {
    isRunning = false;
    raf.remove(key);
  }

  /**
   * Set the progress value.
   *
   * @param {number} newProgress The new progress value.
   * @returns {number}
   */
  function progress(newProgress) {
    if (typeof newProgress === 'undefined') {
      return progressValue;
    }

    progressValue = newProgress;

    // Stop when reaching precision
    if (Math.abs(1 - progressValue) < PROGRESS_PRECISION) {
      progressValue = 1;
      pause();
      requestAnimationFrame(() => onFinish(progressValue, easedProgress));
    }

    easedProgress = ease(progressValue);

    let toIndex = 0;
    while (
      normalizedKeyframes[toIndex] &&
      normalizedKeyframes[toIndex].offset <= easedProgress &&
      normalizedKeyframes[toIndex].offset !== 1
    ) {
      toIndex += 1;
    }

    render(element, normalizedKeyframes[toIndex - 1], normalizedKeyframes[toIndex], easedProgress);
    onProgress(progressValue, easedProgress);

    return progressValue;
  }

  /**
   * Loop for rendering the animation.
   *
   * @param   {Object} props
   * @param   {number} props.time
   * @returns {void}
   */
  function tick(props) {
    if (!isRunning) {
      raf.remove(key);
      return;
    }

    progress(clamp01(map(props.time, startTime, endTime, 0, 1)));
  }

  /**
   * Play the animation.
   *
   * @returns {void}
   */
  function start() {
    // Stop running instances
    const runningKeys = running.get(element);
    runningKeys.forEach((runningPause, runningKey) => {
      runningPause();
      runningKeys.delete(runningKey);
    });
    runningKeys.set(key, pause);
    running.set(element, runningKeys);

    startTime = performance.now();
    endTime = startTime + duration;
    progressValue = 0;
    easedProgress = 0;
    isRunning = true;

    raf.add(key, tick);
  }

  /**
   * Play a paused animation.
   * @returns {void}
   */
  function play() {
    if (isRunning) {
      return;
    }

    startTime = performance.now() - lerp(0, duration, progressValue);
    endTime = startTime + duration;
    isRunning = true;

    raf.add(key, tick);
  }

  return {
    start,
    finish: () => progress(1),
    pause,
    play,
    progress,
  };
}
