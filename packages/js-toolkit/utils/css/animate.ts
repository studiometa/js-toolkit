import { clamp01, lerp, map } from '../math/index.js';
import { isFunction, isNumber } from '../is.js';
import { TRANSFORM_PROPS } from './transform.js';
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
  '%': (value, getSizeRef) => (value * getSizeRef()) / 100,
  vh: (value) => (value * window.innerHeight) / 100,
  vw: (value) => (value * window.innerWidth) / 100,
  vmin: (value) => (value * Math.min(window.innerWidth, window.innerHeight)) / 100,
  vmax: (value) => (value * Math.max(window.innerWidth, window.innerHeight)) / 100,
};

/**
 * Get the value from a step property.
 */
function getAnimationStepValue(val: number | [number, string], getSizeRef: () => number): number {
  if (isNumber(val)) {
    return val;
  }

  if (!val[1] || !CSSUnitConverter[val[1]]) {
    return val[0];
  }

  return CSSUnitConverter[val[1]](val[0], getSizeRef);
}

const generateTranslateRenderStrategy = (sizeRef) => (element, fromValue, toValue, progress) => {
  const from = fromValue ?? 0;
  const to = toValue ?? 0;
  // Fast path: both values are plain numbers (no CSS units)
  if (typeof from === 'number' && typeof to === 'number') {
    return lerp(from, to, progress);
  }
  const getSizeRef = () => element[sizeRef];
  return lerp(
    getAnimationStepValue(from, getSizeRef),
    getAnimationStepValue(to, getSizeRef),
    progress,
  );
};
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
 */
function render(
  element: HTMLElement,
  from: NormalizedKeyframe,
  to: NormalizedKeyframe,
  progress: number,
) {
  const stepProgress = to.easing(map(progress, from.offset, to.offset, 0, 1));

  scheduler.read(() => {
    let opacity: false | number | string = false;
    if (from.opacity !== undefined || to.opacity !== undefined) {
      opacity = map(stepProgress, 0, 1, from.opacity ?? 1, to.opacity ?? 1);
    } else if (element.style.opacity) {
      opacity = '';
    }

    let transformOrigin: false | string = false;
    if (to.transformOrigin !== undefined) {
      transformOrigin = to.transformOrigin;
    } else if (element.style.transformOrigin) {
      transformOrigin = '';
    }

    let customProperties: false | [string, number][] = false;
    if (from.vars !== undefined && to.vars !== undefined) {
      customProperties = [];
      for (const customPropertyName of from.vars) {
        customProperties.push([
          customPropertyName,
          lerp(from[customPropertyName], to[customPropertyName], stepProgress),
        ]);
      }
    }

    // Build transform string directly to avoid object allocation and
    // redundant property checks in transform()
    let transformValue = '';

    // translate3d
    const hasX = from.x !== undefined || to.x !== undefined;
    const hasY = from.y !== undefined || to.y !== undefined;
    const hasZ = from.z !== undefined || to.z !== undefined;
    if (hasX || hasY || hasZ) {
      const x = hasX ? transformRenderStrategies.x(element, from.x, to.x, stepProgress) : 0;
      const y = hasY ? transformRenderStrategies.y(element, from.y, to.y, stepProgress) : 0;
      const z = hasZ ? transformRenderStrategies.z(element, from.z, to.z, stepProgress) : 0;
      transformValue += `translate3d(${x}px, ${y}px, ${z}px) `;
    }

    // rotate
    if (from.rotate !== undefined || to.rotate !== undefined) {
      transformValue += `rotate(${transformRenderStrategies.rotate(element, from.rotate, to.rotate, stepProgress)}deg) `;
    } else {
      if (from.rotateX !== undefined || to.rotateX !== undefined) {
        transformValue += `rotateX(${transformRenderStrategies.rotateX(element, from.rotateX, to.rotateX, stepProgress)}deg) `;
      }
      if (from.rotateY !== undefined || to.rotateY !== undefined) {
        transformValue += `rotateY(${transformRenderStrategies.rotateY(element, from.rotateY, to.rotateY, stepProgress)}deg) `;
      }
      if (from.rotateZ !== undefined || to.rotateZ !== undefined) {
        transformValue += `rotateZ(${transformRenderStrategies.rotateZ(element, from.rotateZ, to.rotateZ, stepProgress)}deg) `;
      }
    }

    // scale
    if (from.scale !== undefined || to.scale !== undefined) {
      transformValue += `scale(${transformRenderStrategies.scale(element, from.scale, to.scale, stepProgress)}) `;
    } else {
      if (from.scaleX !== undefined || to.scaleX !== undefined) {
        transformValue += `scaleX(${transformRenderStrategies.scaleX(element, from.scaleX, to.scaleX, stepProgress)}) `;
      }
      if (from.scaleY !== undefined || to.scaleY !== undefined) {
        transformValue += `scaleY(${transformRenderStrategies.scaleY(element, from.scaleY, to.scaleY, stepProgress)}) `;
      }
      if (from.scaleZ !== undefined || to.scaleZ !== undefined) {
        transformValue += `scaleZ(${transformRenderStrategies.scaleZ(element, from.scaleZ, to.scaleZ, stepProgress)}) `;
      }
    }

    // skew
    if (from.skew !== undefined || to.skew !== undefined) {
      transformValue += `skew(${transformRenderStrategies.skew(element, from.skew, to.skew, stepProgress)}deg) `;
    } else {
      if (from.skewX !== undefined || to.skewX !== undefined) {
        transformValue += `skewX(${transformRenderStrategies.skewX(element, from.skewX, to.skewX, stepProgress)}deg) `;
      }
      if (from.skewY !== undefined || to.skewY !== undefined) {
        transformValue += `skewY(${transformRenderStrategies.skewY(element, from.skewY, to.skewY, stepProgress)}deg) `;
      }
    }

    scheduler.write(() => {
      if (opacity !== false) {
        // @ts-ignore
        element.style.opacity = opacity;
      }
      if (transformOrigin !== false) {
        element.style.transformOrigin = transformOrigin;
      }
      if (customProperties !== false) {
        for (const customProperty of customProperties) {
          element.style.setProperty(customProperty[0], customProperty[1].toString());
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

  if (!running.has(element)) {
    running.set(element, new Map());
  }

  const key = `animate-${id}`;
  id += 1;

  /**
   * Set the progress value.
   */
  function callback(progress: number) {
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
  let previousTimings = [0, 0, 0];
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

    if (timings[index][2] > previousTimings[2]) {
      // eslint-disable-next-line prefer-destructuring
      duration = timings[index][2];
    }

    previousTimings = timings[index];

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
