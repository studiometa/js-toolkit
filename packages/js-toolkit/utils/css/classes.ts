import { isArray } from '../is.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

/**
 * Manage a list of classes as string on an element.
 */
function setClasses(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
  method: 'add' | 'remove' | 'toggle',
  forceToggle?: boolean,
) {
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
 */
export function add(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
) {
  setClasses(element, classNames, 'add');
}

/**
 * Remove class names from an element.
 */
export function remove(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
) {
  setClasses(element, classNames, 'remove');
}

/**
 * Toggle class names from an element.
 */
export function toggle(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
  force?: boolean,
) {
  setClasses(element, classNames, 'toggle', force);
}
