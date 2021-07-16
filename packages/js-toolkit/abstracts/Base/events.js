import getAllProperties from '../../utils/object/getAllProperties.js';
import { debug } from './utils.js';

/**
 * @typedef {import('./index.js').default} Base
 */

/**
 * Bind event handler methods to the root HTML element.
 *
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */
function bindRootEvents(instance, eventMethods) {
  return eventMethods.map((eventMethod) => {
    const eventName = eventMethod.replace(/^on/, '').toLowerCase();

    const handler = (...args) => {
      if (__DEV__) {
        debug(instance, eventMethod, instance.$el, ...args);
      }
      instance[eventMethod](...args);
    };

    instance.$el.addEventListener(eventName, handler);

    return () => {
      instance.$el.removeEventListener(eventName, handler);
    };
  });
}

/**
 * Bind event handler methods to refs HTML element.
 *
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */
function bindRefsEvents(instance, eventMethods) {
  const unbindMethods = [];

  Object.entries(instance.$refs).forEach(([refName, $refOrRefs]) => {
    const $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
    const refEventMethod = `on${refName.replace(/^\w/, (c) => c.toUpperCase())}`;

    eventMethods
      .filter((eventMethod) => eventMethod.startsWith(refEventMethod))
      .forEach((eventMethod) => {
        $refs.forEach(($ref, index) => {
          const eventName = eventMethod.replace(refEventMethod, '').toLowerCase();
          const handler = (...args) => {
            if (__DEV__) {
              debug(instance, eventMethod, $ref, ...args, index);
            }
            instance[eventMethod](...args, index);
          };

          if (__DEV__) {
            debug(instance, 'binding ref event', refName, eventName);
          }

          if ($ref instanceof instance.constructor) {
            // @ts-ignore
            $ref = $ref.$el; // eslint-disable-line no-param-reassign
          }

          /** @type {HTMLElement} */ ($ref).addEventListener(eventName, handler);
          const unbindMethod = () => {
            if (__DEV__) {
              debug(instance, 'unbinding ref event', refName, eventMethod);
            }
            /** @type {HTMLElement} */ ($ref).removeEventListener(eventName, handler);
          };

          unbindMethods.push(unbindMethod);
        });
      });
  });

  return unbindMethods;
}

/**
 * Bind event handler methods to children Base instance.
 * @param  {Base}  instance     A Base instance.
 * @param  {Array} eventMethods A list of methods to bind.
 * @return {Array}              A list of unbind functions.
 */
function bindChildrenEvents(instance, eventMethods) {
  const unbindMethods = [];

  Object.entries(instance.$children).forEach(([childName, $children]) => {
    const childEventMethod = `on${childName.replace(/^\w/, (c) => c.toUpperCase())}`;

    eventMethods
      .filter((eventMethod) => eventMethod.startsWith(childEventMethod))
      .forEach((eventMethod) => {
        $children.forEach(
          /**
           * @param {Base} $child
           * @param {Number} index
           */
          ($child, index) => {
            const eventName = eventMethod.replace(childEventMethod, '').toLowerCase();
            const handler = (...args) => {
              if (__DEV__) {
                debug(instance, eventMethod, $child, ...args, index);
              }
              instance[eventMethod](...args, index);
            };

            if (__DEV__) {
              debug(instance, 'binding child event', childName, eventName);
            }

            const unbindMethod = $child.$on(eventName, handler);
            unbindMethods.push(() => {
              if (__DEV__) {
                debug(instance, 'unbinding child event', childName, eventName);
              }
              unbindMethod();
            });
          }
        );
      });
  });

  return unbindMethods;
}

/**
 * Bind ref and children component's events to their corresponding method.
 *
 * @param  {Base} instance  A Base instance.
 * @return {Array}          A list of methods to unbind the events.
 */
export default function bindEvents(instance) {
  const ROOT_EVENT_REGEX = /^on[A-Z][a-z]+$/;
  const REFS_CHILDREN_EVENT_REGEX = /^on([A-Z]([a-z]+)?)([A-Z][a-z]+)+$/;

  // Get all event methods
  const eventMethods = getAllProperties(instance).reduce(
    (acc, [name]) => {
      // Testing camelCase with one word: onEvent.
      if (ROOT_EVENT_REGEX.test(name) && !acc.root.includes(name)) {
        acc.root.push(name);
        return acc;
      }

      // Testing camelCase with more than two words: onRefEvent.
      if (REFS_CHILDREN_EVENT_REGEX.test(name) && !acc.refsOrChildren.includes(name)) {
        acc.refsOrChildren.push(name);
      }

      return acc;
    },
    { root: [], refsOrChildren: [] }
  );

  const unbindMethods = [
    ...bindRootEvents(instance, eventMethods.root),
    ...bindRefsEvents(instance, eventMethods.refsOrChildren),
    ...bindChildrenEvents(instance, eventMethods.refsOrChildren),
  ];

  return unbindMethods;
}
