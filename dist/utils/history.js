import _slicedToArray from "@babel/runtime/helpers/slicedToArray";
import isObject from "./object/isObject.js";

function updateUrlSearchParam(params, name, value) {
  if (!value) {
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

function updateHistory(mode, _ref5) {
  var _ref5$path = _ref5.path,
      path = _ref5$path === void 0 ? window.location.pathname : _ref5$path,
      _ref5$search = _ref5.search,
      search = _ref5$search === void 0 ? {} : _ref5$search,
      _ref5$hash = _ref5.hash,
      hash = _ref5$hash === void 0 ? window.location.hash : _ref5$hash;
  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var title = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

  if (!window.history) {
    return;
  }

  var url = path;
  var mergedSearch = objectToURLSearchParams(search);

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