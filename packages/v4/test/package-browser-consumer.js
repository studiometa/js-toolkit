import { Base } from '@studiometa/js-toolkit-v4';
import { EVENTS } from '@studiometa/js-toolkit-v4/EVENTS';
import useRaf, { useRaf as namedUseRaf } from '@studiometa/js-toolkit-v4/useRaf';

try {
  let mountedHookCalls = 0;
  class PackedComponent extends Base {
    static config = { name: 'PackedComponent' };

    mounted() {
      mountedHookCalls += 1;
    }
  }

  const element = document.createElement('div');
  document.body.append(element);

  let mountedEvent;
  element.addEventListener(
    EVENTS.component.mounted,
    (event) => {
      mountedEvent = event;
    },
    { once: true },
  );

  let observedEmit;
  element.addEventListener(
    'packed:ready',
    (event) => {
      observedEmit = event;
    },
    { once: true },
  );

  const component = new PackedComponent(element).$mount();
  const emitted = component.$emit('packed:ready', { packed: true });

  globalThis.__V4_PACKED_CONSUMER__ = {
    status: 'passed',
    mountedHookCalls,
    mountedEvent: {
      observed: mountedEvent instanceof CustomEvent,
      type: mountedEvent?.type,
      sameInstance: mountedEvent?.detail.instance === component,
      bubbles: mountedEvent?.bubbles,
      cancelable: mountedEvent?.cancelable,
    },
    emitted: {
      returnedObservedEvent: emitted === observedEmit,
      customEvent: emitted instanceof CustomEvent,
      bubbles: emitted.bubbles,
      cancelable: emitted.cancelable,
      detail: emitted.detail,
    },
    serviceSubpath: useRaf === namedUseRaf && typeof useRaf === 'function',
  };

  component.$terminate();
  element.remove();
} catch (error) {
  globalThis.__V4_PACKED_CONSUMER__ = {
    status: 'failed',
    error: error instanceof Error ? `${error.message}\n${error.stack}` : String(error),
  };
}
