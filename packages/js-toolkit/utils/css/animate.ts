import { lerp, map } from '../math/index.js';
import { isDefined, isFunction, isNumber } from '../is.js';
import transform, { TRANSFORM_PROPS } from './transform.js';
import { domScheduler as scheduler } from '../scheduler.js';
import { tween, normalizeEase } from '../tween.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';
import { startsWith } from '../string/index.js';
import type { TransformProps } from './transform.js';
import type { EasingFunction } from '../math/index.js';
import type { BezierCurve, TweenOptions } from '../tween.js';

export type CSSCustomPropertyName = `--${string}`;

export type Keyframe = TransformProps & {
  opacity?: number;
  transformOrigin?: string;
  easing?: EasingFunction | BezierCurve;
  offset?: number;
  [key: CSSCustomPropertyName]: number;
};

export type NormalizedKeyframe = Keyframe & {
  easing: EasingFunction;
  offset: number;
  vars: string[];
};

export type Animate = {
  start: () => void;
  pause: () => void;
  play: () => void;
  finish: () => void;
  progress: (value?: number) => number;
};

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
      customProperties = from.vars.map((customPropertyName) => {
        const customPropertyValue = lerp(
          from[customPropertyName],
          to[customPropertyName],
          stepProgress,
        );
        return [customPropertyName, customPropertyValue];
      });
    }

    const props = Object.fromEntries(
      TRANSFORM_PROPS.filter((name) => isDefined(from[name]) || isDefined(to[name])).map((name) => [
        name,
        transformRenderStrategies[name](element, from[name], to[name], stepProgress),
      ]),
    );
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
    onStart() {
      if (isFunction(options.onStart)) {
        options.onStart();
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

/**
 * Animate one or more elements.
 */
export function animate(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  keyframes: Keyframe[],
  options: TweenOptions = {},
): Animate {
  const controls = eachElements(elementOrElements, (element) =>
    singleAnimate(element, keyframes, options),
  );

  const delegate =
    (key) =>
    // eslint-disable-next-line consistent-return
    (...args) => {
      if (key === 'progress' && args.length === 0) {
        return controls[0][key]();
      }

      for (const control of controls) {
        control[key](...args);
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
