export function getConfig(instance) {
  var config = instance.constructor.config || instance.config;

  if (!config) {
    throw new Error('The `config` property must be defined.');
  }

  if (!config.name) {
    throw new Error('The `config.name` property is required.');
  }

  if (instance.config && !instance.constructor.config) {
    console.warn("[".concat(config.name, "]"), 'Defining the `config` as a getter is deprecated, replace it with a static property.');
  }

  return config;
}
export function warn(instance) {
  var _console;

  var _getConfig = getConfig(instance),
      name = _getConfig.name;

  for (var _len = arguments.length, msg = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    msg[_key - 1] = arguments[_key];
  }

  (_console = console).warn.apply(_console, ["[".concat(name, "]")].concat(msg));
}
export function log(instance) {
  var _console2;

  var _getConfig2 = getConfig(instance),
      name = _getConfig2.name;

  for (var _len2 = arguments.length, msg = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    msg[_key2 - 1] = arguments[_key2];
  }

  (_console2 = console).log.apply(_console2, ["[".concat(name, "]")].concat(msg));
}
export function debug(instance) {
  if (instance.$options.debug) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    log.apply(void 0, [instance].concat(args));
  }
}
export function hasMethod(obj, name) {
  return typeof obj[name] === 'function';
}
export function callMethod(instance, method) {
  var _instance$method;

  for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
    args[_key4 - 2] = arguments[_key4];
  }

  debug.apply(void 0, [instance, 'callMethod', method].concat(args));

  if (method === 'destroyed' && !instance.$isMounted || method === 'mounted' && instance.$isMounted) {
    debug(instance, 'not', method, 'because the method has already been triggered once.');
    return instance;
  }

  instance.$emit.apply(instance, [method].concat(args));

  if (!hasMethod(instance, method)) {
    return instance;
  }

  (_instance$method = instance[method]).call.apply(_instance$method, [instance].concat(args));

  debug.apply(void 0, [instance, method, instance].concat(args));
  return instance;
}
//# sourceMappingURL=utils.js.map