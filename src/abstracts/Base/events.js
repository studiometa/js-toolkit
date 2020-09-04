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
          const handler = event => {
            debug(instance, eventMethod, $ref, event, index);
            instance[eventMethod](event, index);
          };
          $ref.addEventListener(eventName, handler);

          unbindMethods.push(() => {
            $ref.removeEventListener(eventName, handler);
          });
        });
      });

    eventMethods = eventMethods.filter(([eventMethod]) => !eventMethod.startsWith(refEventMethod));
  });

  eventMethods.forEach(([eventMethod]) => {
    const eventName = eventMethod.replace(/^on/, '').toLowerCase();
    const handler = event => {
      debug(instance, eventMethod, instance.$el, event);
      instance[eventMethod](event);
    };
    instance.$el.addEventListener(eventName, handler);
    unbindMethods.push(() => {
      instance.$el.removeEventListener(eventName, handler);
    });
  });

  return unbindMethods;
}
