function setClasses(element, classNames) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !classNames) {
    return;
  }

  classNames.split(' ').forEach(function (className) {
    element.classList[method](className);
  });
}

export function add(element, classNames) {
  setClasses(element, classNames);
}
export function remove(element, classNames) {
  setClasses(element, classNames, 'remove');
}
export function toggle(element, classNames) {
  setClasses(element, classNames, 'toggle');
}
//# sourceMappingURL=classes.js.map