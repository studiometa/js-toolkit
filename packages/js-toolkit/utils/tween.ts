import { cubicBezier } from '@motionone/easing';
import { lerp, map, clamp01 } from './math/index.js';
import { isDefined, isArray } from './is.js';
import { noop, noopValue as linear } from './noop.js';
import useRaf from '../services/raf.js';
import type { EasingFunction } from './math/createEases.js';

let id = 0;
const PROGRESS_PRECISION = 0.01;

export type BezierCurve = [number, number, number, number];

export interface TweenOptions {
  duration?: number;
  easing?: EasingFunction | BezierCurve;
  onStart?: () => void;
  onProgress?: (progress: number, easedProgress: number) => void;
  onFinish?: (progress: number, easedProgress: number) => void;
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
   */
  function pause() {
    isRunning = false;
    raf.remove(key);
  }

  /**
   * Set the progress value.
   */
  function progress(newProgress: number) {
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
   */
  function tick(props: { time: number }) {
    if (!isRunning) {
      raf.remove(key);
      return;
    }

    progress(clamp01(map(props.time, startTime, endTime, 0, 1)));
  }

  /**
   * Play the animation.
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
