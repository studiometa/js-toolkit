import { cubicBezier } from '@motionone/easing';
import { lerp, map, clamp01, damp, inertiaFinalValue } from './math/index.js';
import { isDefined, isArray, isNumber } from './is.js';
import { noop, noopValue as linear } from './noop.js';
import useRaf from '../services/raf.js';
import type { EasingFunction } from './math/createEases.js';

let id = 0;
const DEFAULT_PROGRESS_PRECISION = 0.0001;

export type BezierCurve = [number, number, number, number];

export interface TweenOptions {
  duration?: number;
  delay?: number;
  easing?: EasingFunction | BezierCurve;
  smooth?: true | number;
  precision?: number;
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  onFinish?: (progress: number) => void;
}

/**
 * Normalize a easing function with default fallbacks.
 */
export function normalizeEase(ease: EasingFunction | BezierCurve): EasingFunction {
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
 */
export function tween(callback: (progress: number) => unknown, options: TweenOptions = {}) {
  const raf = useRaf();

  let progressValue = 0;
  let easedProgress = 0;

  const isSmooth = isDefined(options.smooth) && (isNumber(options.smooth) || options.smooth);
  const smoothFactor = isNumber(options.smooth) ? options.smooth : 0.1;
  const precision = options.precision ?? DEFAULT_PROGRESS_PRECISION;
  const ease = normalizeEase(options.easing);

  let delay = options.delay ?? 0;
  delay *= 1000;
  let duration = options.duration ?? 1;
  duration *= 1000;

  /* eslint-disable @typescript-eslint/no-use-before-define */
  let startTime = getStartTime();
  let endTime = getEndTime(startTime);
  /* eslint-enable @typescript-eslint/no-use-before-define */

  const key = `tw-${id}`;
  id += 1;

  const { onStart = noop, onProgress = noop, onFinish = noop } = options;
  let isRunning = false;

  /**
   * Pause the animation.
   */
  function pause() {
    isRunning = false;
    raf.remove(key);
  }

  /**
   * Set the progress value.
   */
  function progress(newProgress: number) {
    if (!isDefined(newProgress)) {
      return easedProgress;
    }

    easedProgress = newProgress;

    // Stop when reaching precision
    if (Math.abs(1 - easedProgress) < precision) {
      progressValue = 1;
      easedProgress = 1;
    }

    callback(easedProgress);
    onProgress(easedProgress);

    if (easedProgress === 1) {
      pause();
      requestAnimationFrame(() => onFinish(easedProgress));
    }

    return easedProgress;
  }

  /**
   * Loop for rendering the animation.
   */
  function tick(props: { time: number }) {
    if (!isRunning) {
      raf.remove(key);
      return;
    }

    progressValue = clamp01(map(props.time, startTime, endTime, 0, 1));

    progress(
      isSmooth ? damp(progressValue, easedProgress, smoothFactor, precision) : ease(progressValue),
    );
  }

  function getStartTime() {
    return performance.now() + delay;
  }

  function getEndTime(time: number) {
    return isSmooth ? inertiaFinalValue(time, 1) : time + duration;
  }

  /**
   * Play the animation.
   */
  function start() {
    onStart();
    startTime = getStartTime();
    endTime = getEndTime(startTime);
    progressValue = 0;
    easedProgress = 0;
    isRunning = true;

    raf.add(key, tick);
  }

  /**
   * Play a paused animation.
   */
  function play() {
    if (isRunning) {
      return;
    }

    startTime = getStartTime() - lerp(0, duration, progressValue);
    endTime = getEndTime(startTime);
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
