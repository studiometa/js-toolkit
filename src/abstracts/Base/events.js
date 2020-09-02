import getAllProperties from '../../utils/object/getAllProperties';
import { debug } from './utils';

/**
 * Bind ref and children component's events to their corresponding method.
 *
 * @param  {Base} instance  A Base instance.
 * @return {Array}          A list of methods to unbind the events.
 */
export default function bindEvents(instance) {
  const unbindMethods = [];
  // Bind method to events on refs
  let eventMethods = getAllProperties(instance).filter(([name]) => name.startsWith('on'));

  Object.entries(instance.$refs).forEach(([refName, $refOrRefs]) => {
    const $refs = Array.isArray($refOrRefs) ? $refOrRefs : [$refOrRefs];
    const refEventMethod = `on${refName.replace(/^\w/, c => c.toUpperCase())}`;

    eventMethods
      .filter(([eventMethod]) => eventMethod.startsWith(refEventMethod))
      .forEach(([eventMethod]) => {
        $refs.forEach(($ref, index) => {
          const eventName = eventMethod.replace(refEventMethod, '').toLowerCase();
          const handler = (...args) => {
            debug(instance, eventMethod, $ref, ...args, index);
            instance[eventMethod](...args, index);
          };

          let unbindMethod = () => {};
          if ($ref.constructor && $ref.constructor.__isBase__) {
            const unbindComponentEvent = $ref.$on(eventName, handler);
            $ref.$el.addEventListener(eventName, handler);
            unbindMethod = () => {
              unbindComponentEvent();
              $ref.$el.removeEventListener(eventName, handler);
            };
          } else {
            $ref.addEventListener(eventName, handler);
            unbindMethod = () => {
              $ref.removeEventListener(eventName, handler);
            };
          }

          unbindMethods.push(unbindMethod);
        });
      });

    eventMethods = eventMethods.filter(([eventMethod]) => !eventMethod.startsWith(refEventMethod));
  });

  eventMethods.forEach(([eventMethod]) => {
    const eventName = eventMethod.replace(/^on/, '').toLowerCase();
    const handler = (...args) => {
      debug(instance, eventMethod, instance.$el, ...args);
      instance[eventMethod](...args);
    };
    instance.$el.addEventListener(eventName, handler);
    unbindMethods.push(() => {
      instance.$el.removeEventListener(eventName, handler);
    });
  });

  return unbindMethods;
}
