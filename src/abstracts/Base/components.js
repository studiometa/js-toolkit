import { debug } from './utils';

/**
 * Mount a given component which might be async.
 *
 * @param  {Base|Promise} component The component to mount.
 * @return {void}
 */
function mountComponent(component) {
  if (component.__isAsync__) {
    component.then(instance => instance.$mount());
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
  if (!instance.$children) {
    return;
  }

  debug(instance, 'mountComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    $child.forEach(mountComponent);
  });
}

/**
 * Destroy a given component which might be async.
 *
 * @param  {Base|Promise} component The component to destroy.
 * @return {void}
 */
function destroyComponent(component) {
  if (component.__isAsync__) {
    component.then(instance => instance.$destroy());
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
  if (!instance.$children) {
    return;
  }
  debug(instance, 'destroyComponents', instance.$children);

  Object.values(instance.$children).forEach($child => {
    $child.forEach(destroyComponent);
  });
}
