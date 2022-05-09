import { lerp, map, clamp01 } from '../math/index.js';
import isDefined from '../isDefined.js';
import transform from './transform.js';

let id = 0;
const running = new WeakMap();

const noop = () => {};

const PROGRESS_PRECISION = 0.0001;

const CSSUnitConverter = {
  '%': (value, sizeRef) => (sizeRef ? (value * sizeRef) / 100 : value),
  vh: (value) => (value * window.innerHeight) / 100,
  vw: (value) => (value * window.innerWidth) / 100,
  vmin: (value) => (value * Math.min(window.innerWidth, window.innerHeight)) / 100,
  vmax: (value) => (value * Math.max(window.innerWidth, window.innerHeight)) / 100,
};

/**
 * Get the value from a step property.
 * @param   {number|[number, string]} val
 * @param   {number} sizeRef
 * @returns {number}
 */
function getAnimationStepValue(val, sizeRef) {
  if (typeof val === 'number') {
    return val;
  }

  if (!val[1] || !CSSUnitConverter[val[1]]) {
    return val[0];
  }

  return CSSUnitConverter[val[1]](val[0], sizeRef);
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
 * @typedef {import('./transform.js').TransformProps} TransformProps
 * @typedef {{
 *   duration?: number;
 *   ease?: (value: number) => number;
 *   precision?: number;
 *   onProgress?: (progress: number, easedProgress: number) => void;
 *   onEnd?: (progress: number, easedProgress: number) => void;
 *  }} Options
 * @typedef {TransformProps & {
 *   opacity?: number;
 *   ease?: (value: number) => number;
 * }} Step
 * @typedef {{
 *   start: () => void;
 *   pause: () => void;
 *   play: () => void;
 *   end: () => void;
 *   progress: (value: number?) => number
 * }} Animate
 */

/**
 * Animate an element.
 * @param   {HTMLElement} element
 * @param   {[number, Step][]} steps
 * @param   {Options} options
 * @returns {Animate}
 */
export function animate(element, steps, options = {}) {
  let progress = 0;
  let easedProgress = 0;

  if (!running.has(element)) {
    running.set(element, new Map());
  }

  const ease = options.ease ?? linear;
  let duration = options.duration ?? 1;
  duration *= 1000;

  let startTime = performance.now();
  let endTime = startTime + duration;

  const key = `animate-${id}`;
  id += 1;

  const { onProgress = noop, onEnd = noop } = options;
  let isRunning = false;

  /**
   * Pause the animation.
   *
   * @returns {void}
   */
  function pause() {
    if (!isRunning) {
      return;
    }

    isRunning = false;
  }

  /**
   * Stop the animation and resolve the promise.
   *
   * @returns {void}
   */
  function end() {
    pause();
    onEnd(progress, easedProgress);
  }

  /**
   * Update element.
   * @returns {void}
   */
  function update() {
    easedProgress = ease(progress);

    let toIndex = 0;
    while (steps[toIndex] && steps[toIndex][0] <= easedProgress && steps[toIndex][0] !== 1) {
      toIndex += 1;
    }

    const from = steps[toIndex - 1];
    const to = steps[toIndex];

    if (!to || !from) {
      end();
      return;
    }

    const stepEase = to[1].ease ?? linear;
    const stepProgress = stepEase(map(easedProgress, from[0], to[0], 0, 1));

    if (isDefined(from[1].opacity) || isDefined(to[1].opacity)) {
      // @ts-ignore
      element.style.opacity = map(stepProgress, 0, 1, from[1].opacity ?? 1, to[1].opacity ?? 1);
    } else if (element.style.opacity) {
      element.style.opacity = '';
    }

    const transformProps = {};

    if (isDefined(from[1].x) || isDefined(to[1].x)) {
      transformProps.x = lerp(
        getAnimationStepValue(from[1].x ?? 0, element.offsetWidth),
        getAnimationStepValue(to[1].x ?? 0, element.offsetWidth),
        stepProgress
      );
    }

    if (isDefined(from[1].y) || isDefined(to[1].y)) {
      transformProps.y = lerp(
        getAnimationStepValue(from[1].y ?? 0, element.offsetHeight),
        getAnimationStepValue(to[1].y ?? 0, element.offsetHeight),
        stepProgress
      );
    }

    if (isDefined(from[1].z) || isDefined(to[1].z)) {
      transformProps.y = lerp(
        getAnimationStepValue(from[1].z ?? 0, element.offsetWidth),
        getAnimationStepValue(to[1].z ?? 0, element.offsetWidth),
        stepProgress
      );
    }

    if (isDefined(from[1].scale) || to[1].scale) {
      transformProps.scale = lerp(from[1].scale ?? 1, to[1].scale ?? 1, stepProgress);
    } else {
      if (isDefined(from[1].scaleX) || to[1].scaleX) {
        transformProps.scaleX = lerp(from[1].scaleX ?? 1, to[1].scaleX ?? 1, stepProgress);
      }

      if (isDefined(from[1].scaleY) || to[1].scaleY) {
        transformProps.scaleY = lerp(from[1].scaleY ?? 1, to[1].scaleY ?? 1, stepProgress);
      }

      if (isDefined(from[1].scaleZ) || to[1].scaleZ) {
        transformProps.scaleZ = lerp(from[1].scaleZ ?? 1, to[1].scaleZ ?? 1, stepProgress);
      }
    }

    if (isDefined(from[1].skew) || to[1].skew) {
      transformProps.skew = lerp(from[1].skew ?? 0, to[1].skew ?? 0, stepProgress);
    } else {
      if (isDefined(from[1].skewX) || to[1].skewX) {
        transformProps.skewX = lerp(from[1].skewX ?? 0, to[1].skewX ?? 0, stepProgress);
      }

      if (isDefined(from[1].skewY) || to[1].skewY) {
        transformProps.skewY = lerp(from[1].skewY ?? 0, to[1].skewY ?? 0, stepProgress);
      }
    }

    if (isDefined(from[1].rotate) || to[1].rotate) {
      transformProps.rotate = lerp(from[1].rotate ?? 0, to[1].rotate ?? 0, stepProgress);
    } else {
      if (isDefined(from[1].rotateX) || to[1].rotateX) {
        transformProps.rotateX = lerp(from[1].rotateX ?? 0, to[1].rotateX ?? 0, stepProgress);
      }

      if (isDefined(from[1].rotateY) || to[1].rotateY) {
        transformProps.rotateY = lerp(from[1].rotateY ?? 0, to[1].rotateY ?? 0, stepProgress);
      }

      if (isDefined(from[1].rotateZ) || to[1].rotateZ) {
        transformProps.rotateZ = lerp(from[1].rotateZ ?? 0, to[1].rotateZ ?? 0, stepProgress);
      }
    }

    element.style.transform = transform(transformProps);
  }

  /**
   * Set the progress value.
   *
   * @param {number} newProgress The new progress value.
   * @returns {number}
   */
  function setProgress(newProgress) {
    if (typeof newProgress === 'undefined') {
      return progress;
    }

    progress = newProgress;

    // Stop when reaching precision
    if (Math.abs(1 - progress) < PROGRESS_PRECISION) {
      progress = 1;
      requestAnimationFrame(() => end());
    }

    update();
    onProgress(progress, easedProgress);

    return progress;
  }

  /**
   * Loop for rendering the animation.
   *
   * @param   {number} time
   * @returns {void}
   */
  function loop(time) {
    if (!isRunning) {
      return;
    }

    setProgress(clamp01(map(time, startTime, endTime, 0, 1)));
    requestAnimationFrame(loop);
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
    progress = 0;
    easedProgress = 0;
    isRunning = true;

    requestAnimationFrame(loop);
  }

  /**
   * play a paused animation.
   * @returns {void}
   */
  function play() {
    if (isRunning) {
      return;
    }

    startTime = performance.now() - lerp(0, duration, progress);
    endTime = startTime + duration;
    isRunning = true;

    requestAnimationFrame(loop);
  }

  return {
    start,
    pause,
    play,
    end,
    progress: setProgress,
  };
}
