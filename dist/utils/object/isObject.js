import _typeof from "@babel/runtime/helpers/typeof";
export default function isObject(value) {
  return _typeof(value) === 'object' && !!value && value.toString() === '[object Object]';
}
//# sourceMappingURL=isObject.js.map