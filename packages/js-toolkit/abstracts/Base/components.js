import { debug } from './utils.js';

/**
 * @typedef {import('./index.js').default} Base
 */

/**
 * Mount a given component which might be async.
 *
 * @param  {Base|Promise<Base>} component The component to mount.
 * @return {void}
 */
function mountComponent(component) {
  if (component instanceof Promise) {
    component.then((instance) => instance.$mount());
  } else {
    component.$mount();
  }
}

/**
 * Mount children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
export function mountComponents(instance) {
  if (__DEV__) {
    debug(instance, 'mountComponents', instance.$children);
  }

  Object.values(instance.$children).forEach(($child) => {
    if (__DEV__) {
      debug(instance, 'mountComponent', $child);
    }
    $child.forEach(mountComponent);
  });
}

/**
 * Mount or update the given component.
 *
 * @param {Base|Promise<Base>} component [description]
 * @return {void}
 */
function mountOrUpdateComponent(component) {
  if (component instanceof Promise) {
    component.then((instance) => (instance.$isMounted ? instance.$update() : instance.$mount()));
  } else {
    const method = component.$isMounted ? '$update' : '$mount';
    component[method]();
  }
}

/**
 * Mount or updte children components of the given instance.
 *
 * @param {Base} instance The parent component's instance.
 * @return {void}
 */
export function mountOrUpdateComponents(instance) {
  if (__DEV__) {
    debug(instance, 'mountComponents', instance.$children);
  }

  Object.values(instance.$children).forEach(($child) => {
    $child.forEach(mountOrUpdateComponent);
  });
}

/**
 * Destroy a given component which might be async.
 *
 * @param  {Base|Promise} component The component to destroy.
 * @return {void}
 */
function destroyComponent(component) {
  if (component instanceof Promise) {
    component.then((instance) => instance.$destroy());
  } else {
    component.$destroy();
  }
}

/**
 * Destroy children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
export function destroyComponents(instance) {
  if (__DEV__) {
    debug(instance, 'destroyComponents', instance.$children);
  }

  Object.values(instance.$children).forEach(
    /**
     * @param {Array<Base>} $child
     */
    ($child) => {
      $child.forEach(destroyComponent);
    }
  );
}
