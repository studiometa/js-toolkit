import { lerp, map } from '../math/index.js';
import isDefined from '../isDefined.js';
import transform from './transform.js';

let id = 0;
const running = new WeakMap();

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
 *  }} Options
 * @typedef {TransformProps & {
 *   opacity?: number;
 *   ease?: (value: number) => number;
 * }} Step
 * @typedef {{
 *   promise: Promise<void>;
 *   play: () => void;
 *   pause: () => void;
 *   resume: () => void;
 *   stop: () => void;
 *   progress: (value: number?) => number
 * }} Animate
 */

/**
 * Animate an element.
 * @param   {HTMLElement} element
 * @param   {Step[]} steps
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

  const precision = options.precision ?? 0.001;
  let duration = options.duration ?? 2;
  duration *= 1000;

  let startTime = performance.now();
  let endTime = startTime + duration;

  const key = `animate-${id}`;
  id += 1;

  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });

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
  function stop() {
    pause();
    resolve();
  }

  /**
   * Update element.
   * @returns {void}
   */
  function update() {
    easedProgress = ease(progress);

    let toIndex = 0;
    while (steps[toIndex] && steps[toIndex][0] <= easedProgress) {
      toIndex += 1;
    }

    const from = steps[toIndex - 1];
    const to = steps[toIndex];

    if (!to || !from || Math.abs(1 - easedProgress) < precision) {
      stop();
      return;
    }

    const stepEase = to[1].ease ?? linear;

    if (isDefined(from[1].opacity) && isDefined(to[1].opacity)) {
      element.style.opacity = String(stepEase(map(progress, 0, 1, from[1].opacity, to[1].opacity)));
    }

    const stepProgress = stepEase(map(easedProgress, from[0], to[0], 0, 1));
    element.style.transform = transform({
      x: lerp(
        getAnimationStepValue(from[1].x, element.offsetWidth),
        getAnimationStepValue(to[1].x, element.offsetWidth),
        stepProgress
      ),
      y: lerp(
        getAnimationStepValue(from[1].y, element.offsetHeight),
        getAnimationStepValue(to[1].y, element.offsetHeight),
        stepProgress
      ),
      z: lerp(
        getAnimationStepValue(from[1].z, element.offsetWidth),
        getAnimationStepValue(to[1].z, element.offsetWidth),
        stepProgress
      ),
      scaleX: lerp(
        from[1].scale ?? from[1].scaleX ?? 1,
        to[1].scale ?? to[1].scaleX ?? 1,
        stepProgress
      ),
      scaleY: lerp(
        from[1].scale ?? from[1].scaleY ?? 1,
        to[1].scale ?? to[1].scaleY ?? 1,
        stepProgress
      ),
      skewX: lerp(from[1].skew ?? from[1].skewX ?? 0, to[1].skew ?? to[1].skewX ?? 0, stepProgress),
      skewY: lerp(from[1].skew ?? from[1].skewY ?? 0, to[1].skew ?? to[1].skewY ?? 0, stepProgress),
      rotate: lerp(from[1].rotate, to[1].rotate, stepProgress),
    });
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

    progress = map(time, startTime, endTime, 0, 1);
    update();
    requestAnimationFrame(loop);
  }

  /**
   * Set the progress value.
   *
   * @param {number} newProgress The new progress value.
   * @returns {number}
   */
  function setProgress(newProgress) {
    if (typeof newProgress !== 'undefined') {
      progress = newProgress;
      update();
    }

    return progress;
  }

  /**
   * Play the animation.
   *
   * @returns {void}
   */
  function play() {
    // Stop running instances
    const runningKeys = running.get(element);
    runningKeys.forEach((runningStop, runningKey) => {
      runningStop();
      runningKeys.delete(runningKey);
    });
    runningKeys.set(key, stop);
    running.set(element, runningKeys);

    startTime = performance.now();
    endTime = startTime + duration;
    progress = 0;
    easedProgress = 0;
    isRunning = true;

    requestAnimationFrame(loop);
  }

  /**
   * Resume a paused animation.
   * @returns {void}
   */
  function resume() {
    if (isRunning) {
      return;
    }

    startTime = performance.now() - lerp(0, duration, progress);
    endTime = startTime + duration;
    isRunning = true;
    requestAnimationFrame(loop);
  }

  return {
    promise,
    play,
    pause,
    resume,
    stop,
    progress: setProgress,
  };
}
