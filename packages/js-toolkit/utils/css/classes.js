import { isArray } from '../is.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

/**
 * Manage a list of classes as string on an element.
 *
 * @param {Element|Element[]|NodeListOf<Element>} element The element to update.
 * @param {string|string[]} classNames A string of class names.
 * @param {'add'|'remove'|'toggle'} [method] The method to use: add, remove or toggle.
 * @param {boolean} [forceToggle] Force toggle?
 */
function setClasses(element, classNames, method, forceToggle) {
  if (!element || !classNames) {
    return;
  }

  const normalizedClassNames = isArray(classNames)
    ? classNames
    : classNames.split(' ').filter((className) => className);

  if (method !== 'toggle') {
    eachElements(element, (el) => el.classList[method](...normalizedClassNames));
  } else {
    normalizedClassNames.forEach((className) =>
      eachElements(element, (el) => el.classList[method](className, forceToggle)),
    );
  }
}

/**
 * Add class names to an element.
 *
 * @param   {Element|Element[]|NodeListOf<Element>}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @returns {void}
 */
export function add(element, classNames) {
  setClasses(element, classNames, 'add');
}

/**
 * Remove class names from an element.
 *
 * @param   {Element|Element[]|NodeListOf<Element>}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @returns {void}
 */
export function remove(element, classNames) {
  setClasses(element, classNames, 'remove');
}

/**
 * Toggle class names from an element.
 *
 * @param   {Element|Element[]|NodeListOf<Element>}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @param   {boolean}         [force]    Force toggle?
 * @returns {void}
 */
export function toggle(element, classNames, force) {
  setClasses(element, classNames, 'toggle', force);
}
