/* eslint no-underscore-dangle: ["error", { "allow": ["__isTransitioning__"] }] */
import nextFrame from './nextFrame';
import setClasses from './setClasses';

/**
 * Test if the given element has a transition duration.
 *
 * @param  {HTMLElement} element The element to test.
 * @return {Boolean}             The result of the test.
 */
function testTransition(element) {
  return typeof window === 'undefined'
    ? false
    : window.getComputedStyle(element).transitionDuration !== '0s';
}

/**
 * Apply the from state.
 *
 * @return {Promise}
 */
async function start(element, classes) {
  element.__isTransitioning__ = true;
  setClasses(element, classes.from);
  await nextFrame();
  setClasses(element, classes.active);
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
      const transitionEndHandler = () => {
        resolve();
        element.removeEventListener('transitionend', transitionEndHandler);
      };
      element.addEventListener('transitionend', transitionEndHandler, false);
    }
    setClasses(element, classes.from, 'remove');
    if (!hasTransition) {
      await nextFrame();
    }
    setClasses(element, classes.to);
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
  setClasses(element, classes.to, 'remove');
  setClasses(element, classes.active, 'remove');
  element.__isTransitioning__ = false;
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
export default async function transition(element, name = 'transition') {
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
}
