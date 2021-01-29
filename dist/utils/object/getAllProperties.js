import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";
export default function getAllProperties(object) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var proto = Object.getPrototypeOf(object);

  if (proto === Object.prototype) {
    return props;
  }

  return getAllProperties(proto, Object.getOwnPropertyNames(proto).map(function (name) {
    return [name, proto];
  }).reduce(function (acc, val) {
    return [].concat(_toConsumableArray(acc), [val]);
  }, props));
}
//# sourceMappingURL=getAllProperties.js.map