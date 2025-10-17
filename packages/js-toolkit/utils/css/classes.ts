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
    for (const className of normalizedClassNames)
      eachElements(element, (el) => el.classList[method](className, forceToggle));
  }
}

/**
 * Add class names to an element.
 * @link https://js-toolkit.studiometa.dev/utils/css/addClass.html
*/
export function add(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
) {
  setClasses(element, classNames, 'add');
}

/**
 * Remove class names from an element.
 * @link https://js-toolkit.studiometa.dev/utils/css/removeClass.html
*/
export function remove(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
) {
  setClasses(element, classNames, 'remove');
}

/**
 * Toggle class names from an element.
 * @link https://js-toolkit.studiometa.dev/utils/css/toggleClass.html
*/
export function toggle(
  element: Element | Element[] | NodeListOf<Element>,
  classNames: string | string[],
  force?: boolean,
) {
  setClasses(element, classNames, 'toggle', force);
}
