import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import isObject from '../object/isObject';
export default function setStyles(element, styles) {
  var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'add';

  if (!element || !styles || !isObject(styles)) {
    return;
  }

  Object.entries(styles).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        prop = _ref2[0],
        value = _ref2[1];

    element.style[prop] = method === 'add' ? value : '';
  });
}
export function add(element, styles) {
  setStyles(element, styles);
}
export function remove(element, styles) {
  setStyles(element, styles, 'remove');
}
//# sourceMappingURL=styles.js.map