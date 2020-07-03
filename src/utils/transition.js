/* eslint no-underscore-dangle: ["error", { "allow": ["__isTransitioning__", "__transitionEndHandler__"] }] */
import nextFrame from './nextFrame';
import setClasses from './setClasses';
import setStyles from './setStyles';

/**
 * Update either the classes or the styles of an element with the given method.
 *
 * @param {HTMLElement}   element         The element to update.
 * @param {String|Object} classesOrStyles The classes or styles to apply.
 * @param {String}        method          The method to use, one of `add` or `remove`.
 */
function setClassesOrStyles(element, classesOrStyles, method = 'add') {
  if (typeof classesOrStyles === 'string') {
    setClasses(element, classesOrStyles, method);
  } else {
    setStyles(element, classesOrStyles, method);
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
 * @return {Promise}
 */
async function start(element, classes) {
  element.__isTransitioning__ = true;
  setClassesOrStyles(element, classes.from);
  await nextFrame();
  setClassesOrStyles(element, classes.active);
  await nextFrame();
}

/**
 * Apply the active state.
 *
 * @return {Promise}
 */
async function next(element, classes) {
  const hasTransition = testTransition(element);

  /* eslint-disable-next-line */
  return new Promise(async resolve => {
    if (hasTransition) {
      element.__transitionEndHandler__ = resolve;
      element.addEventListener('transitionend', element.__transitionEndHandler__, false);
    }
    setClassesOrStyles(element, classes.from, 'remove');
    if (!hasTransition) {
      await nextFrame();
    }
    setClassesOrStyles(element, classes.to);
    await nextFrame();
    if (!hasTransition) {
      resolve();
    }
  });
}

/**
 * Apply the final state.
 *
 * @return {void}
 */
function end(element, classes) {
  element.removeEventListener('transitionend', element.__transitionEndHandler__, false);
  setClassesOrStyles(element, classes.to, 'remove');
  setClassesOrStyles(element, classes.active, 'remove');
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
 * @param  {String|Object} name    The name of the transition or an object with the hooks classes.
 * @return {Promise}               A promise resolving at the end of the transition.
 */
export default async function transition(element, name) {
  const classes =
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
    end(element, classes);
    await nextFrame();
  }

  await start(element, classes);
  await next(element, classes);
  end(element, classes);
  return Promise.resolve();
}
