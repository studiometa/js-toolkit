/**
 * Manage a list of classes as string on an element.
 *
 * @param {HTMLElement} element The element to update.
 * @param {string|string[]} classNames A string of class names.
 * @param {'add'|'remove'|'toggle'} [method='add'] The method to use: add, remove or toggle.
 * @param {boolean} [forceToggle] Force toggle?
 */
function setClasses(element, classNames, method = 'add', forceToggle = false) {
  if (!element || !classNames) {
    return;
  }

  const normalizedClassNames = Array.isArray(classNames) ? classNames : classNames.split(' ');

  if (method !== 'toggle') {
    element.classList[method](...normalizedClassNames);
  } else {
    normalizedClassNames.forEach((className) => element.classList[method](className, forceToggle));
  }
}

/**
 * Add class names to an element.
 *
 * @param   {HTMLElement}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @returns {void}
 */
export function add(element, classNames) {
  setClasses(element, classNames);
}

/**
 * Remove class names from an element.
 *
 * @param   {HTMLElement}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @returns {void}
 */
export function remove(element, classNames) {
  setClasses(element, classNames, 'remove');
}

/**
 * Toggle class names from an element.
 *
 * @param   {HTMLElement}     element    The element to update.
 * @param   {string|string[]} classNames A string of class names.
 * @param   {boolean}         [force]    Force toggle?
 * @returns {void}
 */
export function toggle(element, classNames, force) {
  setClasses(element, classNames, 'toggle', force);
}
