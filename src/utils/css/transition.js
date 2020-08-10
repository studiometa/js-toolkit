/* eslint no-underscore-dangle: ["error", { "allow": ["__isTransitioning__", "__transitionEndHandler__"] }] */
import nextFrame from '../nextFrame';
import * as classes from './classes';
import * as styles from './styles';

/**
 * Update either the classes or the styles of an element with the given method.
 *
 * @param {HTMLElement}   element         The element to update.
 * @param {String|Object} classesOrStyles The classes or styles to apply.
 * @param {String}        method          The method to use, one of `add` or `remove`.
 */
export function setClassesOrStyles(element, classesOrStyles, method = 'add') {
  if (typeof classesOrStyles === 'string') {
    classes[method](element, classesOrStyles, method);
  } else {
    styles[method](element, classesOrStyles, method);
  }
}

/**
 * Test if the given element has a transition duration.
 *
 * @param  {HTMLElement} element The element to test.
 * @return {Boolean}             The result of the test.
 */
function testTransition(element) {
  if (typeof window === 'undefined') {
    return false;
  }

  const { transitionDuration } = window.getComputedStyle(element);
  return !!transitionDuration && transitionDuration !== '0s';
}

/**
 * Apply the from state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */
async function start(element, classesOrStyles) {
  element.__isTransitioning__ = true;
  setClassesOrStyles(element, classesOrStyles.from);
  await nextFrame();
  setClassesOrStyles(element, classesOrStyles.active);
  await nextFrame();
}

/**
 * Apply the active state.
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @return {Promise}
 */
async function next(element, classesOrStyles) {
  const hasTransition = testTransition(element);

  /* eslint-disable-next-line */
  return new Promise(async resolve => {
    if (hasTransition) {
      element.__transitionEndHandler__ = resolve;
      element.addEventListener('transitionend', element.__transitionEndHandler__, false);
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
 *
 * @param {HTMLElement}   element         The target element.
 * @param {String|Object} classesOrStyles The classes or styles definition.
 * @param {String}        mode            Whether to remove or keep the `to`  classes/styles.
 * @return {void}
 */
function end(element, classesOrStyles, mode = 'remove') {
  element.removeEventListener('transitionend', element.__transitionEndHandler__, false);
  if (mode === 'remove') {
    setClassesOrStyles(element, classesOrStyles.to, 'remove');
  }
  setClassesOrStyles(element, classesOrStyles.active, 'remove');
  delete element.__isTransitioning__;
  delete element.__transitionEndHandler__;
}

/**
 * Manage CSS transition with class.
 *
 * This is heavily inspired by the Vue `<transition>` component
 * and the `@barba/css` package, many thanks to them!
 *
 * @param  {HTMLElement}   element The target element.
 * @param  {String|Object} name    The name of the transition or an object with the hooks classesOrStyles.
 * @param  {String}        endMode    Whether to remove or keep the `to` classes/styles
 * @return {Promise}               A promise resolving at the end of the transition.
 */
export default async function transition(element, name, endMode = 'remove') {
  const classesOrStyles =
    typeof name === 'string'
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

  // End any previous transition running on the element.
  if (element.__isTransitioning__) {
    end(element, classesOrStyles);
  }

  await start(element, classesOrStyles);
  await next(element, classesOrStyles);
  end(element, classesOrStyles, endMode);
  return Promise.resolve();
}
