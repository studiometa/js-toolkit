import type { Base } from '../Base/Base.js';
/**
 * Log children.
 */
function logChildren(instance: Base | Promise<Base>) {
  if (instance instanceof Promise) {
    let resolvedInstance: Base;
    instance.then((r) => {
      resolvedInstance = r;
    });
    console.log(
      'This is an async component instance which has not yet been resolved or mounted.',
      'This is an async component. It is not yet resolved or mounted.',
      'You can try to access its instance with the following `maybeLoadInstance` getter.',
      'You can also call the global $logTree function again.',
    );
    console.log({
      get maybeLoadInstance() {
        return resolvedInstance;
      },
    });
    return;
  }

  console.groupCollapsed(instance.$id);

  console.log(instance);
  for (const [name, children] of Object.entries(instance.$children)) {
    console.groupCollapsed(name, `(${children.length})`);
    for (const child of children) {
      logChildren(child);
    }
    console.groupEnd();
  }
  console.groupEnd();
}

export function logTree(instance: Base) {
  console.log('————————————————————————————————');
  logChildren(instance);
  console.log('————————————————————————————————');
}
