/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @param {String}      method     The method to use: add, remove or toggle.
 */
function setClasses(element, classNames, method = 'add') {
  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(className => {
    element.classList[method](className);
  });
}

/**
 * Add class names to an element.
 *
 * @param {HTMLElement} element    The element to update.
 * @param {String}      classNames A string of class names.
 * @return {void}
 */
export function add(element, classNames) {
  setClasses(element, classNames);
}

/**
 * Remove class names from an element.
 *
 * @param  {HTMLElement} element    The element to update.
 * @param  {String}      classNames A string of class names.
 * @return {void}
 */
export function remove(element, classNames) {
  setClasses(element, classNames, 'remove');
}

/**
 * Toggle class names from an element.
 *
 * @param  {HTMLElement} element    The element to update.
 * @param  {String}      classNames A string of class names.
 * @return {void}
 */
export function toggle(element, classNames) {
  setClasses(element, classNames, 'toggle');
}
