import { nextFrame } from '../nextFrame.js';
import * as classes from './classes.js';
import * as styles from './styles.js';
import { isArray, isString } from '../is.js';
import { hasWindow } from '../has.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

/** WeakMap to hold the transition instances. */
const cache = new WeakMap();

export type ClassesOrStyles = string | string[] | Partial<CSSStyleDeclaration>;

export type TransitionStyles = {
  from?: ClassesOrStyles;
  active?: ClassesOrStyles;
  to?: ClassesOrStyles;
};

/**
 * Transition class.
 */
class Transition {
  /**
   * Is a transition currently running?
   */
  isTransitioning = false;

  /**
   * A callback to execute when the transition ends.
   */
  transitionEndHandler: EventListenerOrEventListenerObject | null = null;

  /**
   * Instantiate and save the instance to the cache.
   */
  constructor(element: HTMLElement) {
    cache.set(element, this);
  }

  /**
   * Get the transition class attached to the given element.
   * @param  {HTMLElement} element The HTML element concerned by the transition.
   * @returns {Transition}          The transition instance tied to the given element.
   */
  static getInstance(element: HTMLElement): Transition {
    let instance = cache.get(element);

    if (!instance) {
      instance = new this(element);
    }

    return instance;
  }
}

/**
 * Update either the classes or the styles of an element with the given method.
 */
export function setClassesOrStyles(
  element: HTMLElement,
  classesOrStyles: ClassesOrStyles,
  method: 'add' | 'remove' = 'add',
) {
  if (isString(classesOrStyles) || isArray(classesOrStyles)) {
    classes[method](element, classesOrStyles);
  } else {
    styles[method](element, classesOrStyles);
  }
}

/**
 * Test if the given element has a transition duration.
 */
function testTransition(element: HTMLElement) {
  if (!hasWindow()) {
    return false;
  }

  const { transitionDuration } = window.getComputedStyle(element);
  return !!transitionDuration && transitionDuration !== '0s';
}

/**
 * Apply the from state.
 */
async function start(element: HTMLElement, classesOrStyles: TransitionStyles) {
  const trs = Transition.getInstance(element);
  trs.isTransitioning = true;
  setClassesOrStyles(element, classesOrStyles.from);
  await nextFrame();
  setClassesOrStyles(element, classesOrStyles.active);
}

/**
 * Apply the active state.
 */
async function next(element: HTMLElement, classesOrStyles: TransitionStyles): Promise<void> {
  const hasTransition = testTransition(element);

  /* eslint-disable-next-line */
  return new Promise(async (resolve) => {
    if (hasTransition) {
      const trs = Transition.getInstance(element);
      trs.transitionEndHandler = () => resolve();
      element.addEventListener('transitionend', trs.transitionEndHandler, false);
    }
    setClassesOrStyles(element, classesOrStyles.from, 'remove');
    setClassesOrStyles(element, classesOrStyles.to);
    await nextFrame();
    if (!hasTransition) {
      resolve();
    }
  });
}

/**
 * Apply the final state.
 */
function end(
  element: HTMLElement,
  classesOrStyles: TransitionStyles,
  mode: 'keep' | 'remove' = 'remove',
) {
  const trs = Transition.getInstance(element);
  element.removeEventListener('transitionend', trs.transitionEndHandler, false);
  if (mode === 'remove') {
    setClassesOrStyles(element, classesOrStyles.to, 'remove');
  }
  setClassesOrStyles(element, classesOrStyles.active, 'remove');
  trs.isTransitioning = false;
  trs.transitionEndHandler = null;
}

/**
 * Manage CSS transition with class.
 *
 * This is inspired by the Vue `<transition>` component
 * and the `@barba/css` package, many thanks to them!
 *
 * @param  {HTMLElement}             element The target element.
 * @param  {string|TransitionStyles} name    The name of the transition or an object with the hooks classesOrStyles.
 * @param  {string}                  endMode Whether to remove or keep the `to` classes/styles
 * @returns {Promise<void>}                   A promise resolving at the end of the transition.
 */
async function singleTransition(
  element: HTMLElement,
  name: string | TransitionStyles,
  endMode: 'keep' | 'remove' = 'remove',
): Promise<void> {
  /** @type {TransitionStyles} */
  const classesOrStyles = isString(name)
    ? {
        from: `${name}-from`,
        active: `${name}-active`,
        to: `${name}-to`,
      }
    : {
        from: '',
        active: '',
        to: '',
        ...name,
      };

  const trs = Transition.getInstance(element);
  // End any previous transition running on the element.
  if (trs.isTransitioning) {
    end(element, classesOrStyles);
  }

  await start(element, classesOrStyles);
  await next(element, classesOrStyles);
  end(element, classesOrStyles, endMode);
  return Promise.resolve();
}

/**
 * Manage CSS transition with class.
 *
 * @param  {HTMLElement|HTMLElement[]|NodeListOf<HTMLElement>} elementOrElements The target element or elements.
 * @param  {string|TransitionStyles}                           name              The name of the transition or an object with the hooks classesOrStyles.
 * @param  {string}                                            endMode           Whether to remove or keep the `to` classes/styles
 * @returns {Promise<void>}                                                      A promise resolving at the end of the transition.
 */
export default async function transition(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  name: string | TransitionStyles,
  endMode: 'keep' | 'remove' = 'remove',
) {
  await Promise.all(
    eachElements(elementOrElements, (element) => singleTransition(element, name, endMode)),
  );
}
