import { clamp01, lerp, map, mean } from '../math/index.js';
import { isDefined, isFunction, isNumber } from '../is.js';
import { transform, TRANSFORM_PROPS } from './transform.js';
import { domScheduler as scheduler } from '../scheduler.js';
import { tween, normalizeEase } from '../tween.js';
// eslint-disable-next-line import/extensions
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

const generateTranslateRenderStrategy = (sizeRef) => (element, fromValue, toValue, progress) =>
  lerp(
    getAnimationStepValue(
      fromValue ?? 0,
      /* istanbul ignore next */
      () => element[sizeRef],
    ),
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
    if (isDefined(from.opacity) || isDefined(to.opacity)) {
      opacity = map(stepProgress, 0, 1, from.opacity ?? 1, to.opacity ?? 1);
    } else if (element.style.opacity) {
      opacity = '';
    }

    let transformOrigin: false | string = false;
    if (isDefined(to.transformOrigin)) {
      transformOrigin = to.transformOrigin;
    } else if (element.style.transformOrigin) {
      transformOrigin = '';
    }

    let customProperties: false | [string, number][] = false;
    if (isDefined(from.vars) && isDefined(to.vars)) {
      customProperties = [];
      for (const customPropertyName of from.vars) {
        customProperties.push([
          customPropertyName,
          lerp(from[customPropertyName], to[customPropertyName], stepProgress),
        ]);
      }
    }

    const props = {};

    for (const name of TRANSFORM_PROPS) {
      if (isDefined(from[name]) || isDefined(to[name])) {
        props[name] = transformRenderStrategies[name](element, from[name], to[name], stepProgress);
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
      transform(element, props);
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

  const controls = eachElements(elementOrElements, (element, index) => {
    const delay = staggerIsFunction ? stagger(element, index) : stagger * index;
    const itemOptions = { ...options, delay } as TweenOptions;

    if (durationFn) {
      itemOptions.duration = durationFn(element, index);
    } else if (!isDefined(itemOptions.duration)) {
      itemOptions.duration = 1;
    }

    timings[index] = [itemOptions.duration, delay, itemOptions.duration + delay];

    if (timings[index][2] > previousTimings[2]) {
      // eslint-disable-next-line prefer-destructuring
      duration = timings[index][2];
    }

    previousTimings = timings[index];

    progresses[index] = 0;
    itemOptions.onProgress = (itemProgress) => {
      progresses[index] = itemProgress;
      if (progressFn) {
        progressFn(mean(progresses));
      }
    };

    return singleAnimate(element, keyframes, itemOptions);
  });

  const delegate = (key) =>
    // eslint-disable-next-line consistent-return
    function delegated() {
      if (key === 'progress') {
        if (arguments.length === 1) {
          // eslint-disable-next-line prefer-rest-params
          const newProgress = arguments[0];
          const newTime = lerp(0, duration, newProgress);
          for (const [index, control] of controls.entries()) {
            const controlProgress = clamp01(
              map(newTime, timings[index][1], timings[index][2], 0, 1),
            );
            control.progress(controlProgress);
          }
        }

        return mean(progresses);
      }

      for (const control of controls) {
        // eslint-disable-next-line prefer-rest-params
        control[key].call(null, arguments);
      }
    };

  return {
    start: delegate('start'),
    pause: delegate('pause'),
    finish: delegate('finish'),
    play: delegate('play'),
    progress: delegate('progress'),
  };
}
