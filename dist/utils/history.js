import _defineProperty from "@babel/runtime/helpers/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/slicedToArray";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import isObject from "./object/isObject.js";

function updateUrlSearchParam(params, name, value) {
  if (value === '' || value === null || value === undefined) {
    if (params.has(name)) {
      params.delete(name);
    }

    return params;
  }

  if (Array.isArray(value)) {
    value.forEach(function (val, index) {
      var arrayName = "".concat(name, "[").concat(index, "]");
      updateUrlSearchParam(params, arrayName, val);
    });
    return params;
  }

  if (isObject(value)) {
    Object.entries(value).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          val = _ref2[1];

      var objectName = "".concat(name, "[").concat(key, "]");
      updateUrlSearchParam(params, objectName, val);
    });
    return params;
  }

  params.set(name, value);
  return params;
}

function objectToURLSearchParams(obj) {
  var defaultSearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : window.location.search;
  return Object.entries(obj).reduce(function (urlSearchParams, _ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        name = _ref4[0],
        value = _ref4[1];

    return updateUrlSearchParam(urlSearchParams, name, value);
  }, new URLSearchParams(defaultSearch));
}

function updateHistory(mode, options) {
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var title = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  if (!window.history) {
    return;
  }

  var _path$search$hash$opt = _objectSpread({
    path: window.location.pathname,
    search: new URLSearchParams(window.location.search),
    hash: window.location.hash
  }, options),
      path = _path$search$hash$opt.path,
      search = _path$search$hash$opt.search,
      hash = _path$search$hash$opt.hash;

  var url = path;
  var mergedSearch = search instanceof URLSearchParams ? search : objectToURLSearchParams(search);

  if (mergedSearch.toString()) {
    url += "?".concat(mergedSearch.toString());
  }

  if (hash) {
    if (hash.startsWith('#')) {
      url += hash;
    } else {
      url += "#".concat(hash);
    }
  }

  var method = "".concat(mode, "State");
  window.history[method](data, title, url);
}

export function push(options, data, title) {
  updateHistory('push', options, data, title);
}
export function replace(options, data, title) {
  updateHistory('replace', options, data, title);
}
//# sourceMappingURL=history.js.map