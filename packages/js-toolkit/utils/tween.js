import { cubicBezier } from '@motionone/easing';
import { lerp, map, clamp01 } from './math/index.js';
import { isDefined, isArray } from './is.js';
import { noop, noopValue as linear } from './noop.js';
import useRaf from '../services/raf.js';

let id = 0;
const PROGRESS_PRECISION = 0.01;

/**
 * @typedef {[number, number, number, number]} BezierCurve
 * @typedef {{
 *   duration?: number;
 *   easing?: import('./math/createEases.js').EasingFunction|BezierCurve;
 *   onStart?: () => void;
 *   onProgress?: (progress: number, easedProgress: number) => void;
 *   onFinish?: (progress: number, easedProgress: number) => void;
 *  }} TweenOptions
 */

/**
 * Normalize a easing function with default fallbacks.
 * @param   {((p:number) => number)|[number,number,number,number]} ease
 * @returns {(p:number) => number}
 */
export function normalizeEase(ease) {
  if (!isDefined(ease)) {
    return linear;
  }

  if (isArray(ease)) {
    return cubicBezier(...ease);
  }

  return ease;
}

/**
 * Tween from 0 to 1.
 * @param   {(progress:number)=>any} callback
 * @param   {TweenOptions} [options]
 * @returns {any}
 */
export function tween(callback, options = {}) {
  const raf = useRaf();

  let progressValue = 0;
  let easedProgress = 0;

  const ease = normalizeEase(options.easing);
  let duration = options.duration ?? 1;
  duration *= 1000;

  let startTime = performance.now();
  let endTime = startTime + duration;

  const key = `tw-${id}`;
  id += 1;

  const { onStart = noop, onProgress = noop, onFinish = noop } = options;
  let isRunning = false;

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
      return easedProgress;
    }

    progressValue = newProgress;
    easedProgress = ease(progressValue);

    // Stop when reaching precision
    if (Math.abs(1 - easedProgress) < PROGRESS_PRECISION) {
      progressValue = 1;
      easedProgress = 1;
    }

    callback(easedProgress);
    onProgress(progressValue, easedProgress);

    if (easedProgress === 1) {
      pause();
      requestAnimationFrame(() => onFinish(progressValue, easedProgress));
    }

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
    onStart();
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
