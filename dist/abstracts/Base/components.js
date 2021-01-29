import { debug } from './utils';

function mountComponent(component) {
  if (component instanceof Promise) {
    component.then(function (instance) {
      return instance.$mount();
    });
  } else {
    component.$mount();
  }
}

export function mountComponents(instance) {
  debug(instance, 'mountComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    debug(instance, 'mountComponent', $child);
    $child.forEach(mountComponent);
  });
}

function destroyComponent(component) {
  if (component instanceof Promise) {
    component.then(function (instance) {
      return instance.$destroy();
    });
  } else {
    component.$destroy();
  }
}

export function destroyComponents(instance) {
  debug(instance, 'destroyComponents', instance.$children);
  Object.values(instance.$children).forEach(function ($child) {
    $child.forEach(destroyComponent);
  });
}
//# sourceMappingURL=components.js.map