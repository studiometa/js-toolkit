import usePointer from '../../services/pointer';
import useRaf from '../../services/raf';
import useResize from '../../services/resize';
import useScroll from '../../services/scroll';
import useKey from '../../services/key';
import { hasMethod, callMethod } from './utils';
/**
 * @typedef {import('./index').default} Base
 */

/**
 * Init the given service and bind it to the given instance.
 *
 * @param  {Base}     instance The Base instance.
 * @param  {String}   method   The instance to test for binding
 * @param  {Function} service  The service `use...` function
 * @return {Function}          A function to unbind the service
 */

function initService(instance, method, service) {
  if (!hasMethod(instance, method)) {
    return function () {};
  }

  var _service = service(),
      add = _service.add,
      remove = _service.remove;

  add(instance.$id,
  /**
   * @param {any[]} args
   */
  function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callMethod.apply(void 0, [instance, method].concat(args));
  });
  return function () {
    return remove(instance.$id);
  };
}
/**
 * Use the services.
 * @param  {Base} instance A Base class instance.
 * @return {Array}         A list of unbind methods.
 */


export default function bindServices(instance) {
  var unbindMethods = [initService(instance, 'scrolled', useScroll), initService(instance, 'resized', useResize), initService(instance, 'ticked', useRaf), initService(instance, 'moved', usePointer), initService(instance, 'keyed', useKey)]; // Fire the `loaded` method on window load
  // @todo remove this? or move it elsewhere?

  if (hasMethod(instance, 'loaded')) {
    /**
     * @param {Event} event
     */
    var loadedHandler = function loadedHandler(event) {
      callMethod(instance, 'loaded', {
        event: event
      });
    };

    window.addEventListener('load', loadedHandler);
    unbindMethods.push(function () {
      window.removeEventListener('load', loadedHandler);
    });
  }

  return unbindMethods;
}
//# sourceMappingURL=services.js.map