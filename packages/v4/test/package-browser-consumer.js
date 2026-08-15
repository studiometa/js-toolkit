import {
  Base,
  DIAGNOSTICS,
  createContext,
  domUpdate as rootDomUpdate,
  emitExtendable as rootEmitExtendable,
  provideContext,
  subscribeContext as rootSubscribeContext,
  watchAttributes as rootWatchAttributes,
  whenDOMSettled,
} from '@studiometa/js-toolkit-v4';
import diagnosticsFromSubpath from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
import domUpdate from '@studiometa/js-toolkit-v4/domUpdate';
import emitExtendable from '@studiometa/js-toolkit-v4/emitExtendable';
import subscribeContext from '@studiometa/js-toolkit-v4/subscribeContext';
import watchAttributes from '@studiometa/js-toolkit-v4/watchAttributes';
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

  let diagnosticEvent;
  element.addEventListener(
    EVENTS.diagnostic,
    (event) => {
      diagnosticEvent = event;
      event.preventDefault();
    },
    { once: true },
  );
  component.$emit('packed:invalid', 1);

  let domUpdateEvent;
  element.addEventListener(EVENTS.dom.update, (event) => {
    domUpdateEvent = event;
  });
  const update = domUpdate(element, () => {
    element.dataset.updated = 'yes';
  });
  const updatedSynchronously = element.dataset.updated === 'yes';

  let extendableEvent;
  let extensionSettled = false;
  element.addEventListener('packed:close', (event) => {
    extendableEvent = event;
    event.detail.waitUntil(
      Promise.resolve().then(() => {
        extensionSettled = true;
      }),
    );
  });
  await Promise.all([update, emitExtendable(element, 'packed:close')]);

  const attributeChanges = [];
  const stopWatchingAttributes = watchAttributes(element, (change) => {
    attributeChanges.push(change);
  });
  element.setAttribute('data-packed-watch', 'one');
  await whenDOMSettled();
  stopWatchingAttributes();
  stopWatchingAttributes();
  element.setAttribute('data-packed-watch', 'two');
  await whenDOMSettled();

  const contextConsumer = document.createElement('span');
  element.append(contextConsumer);
  const contextKey = createContext('packed-subscription');
  const contextProvider = provideContext(element, contextKey, 'packed');
  const contextAnswers = [];
  const unsubscribeContext = subscribeContext(contextConsumer, contextKey, (value) => {
    contextAnswers.push(value);
    return () => contextAnswers.push(`leave:${value}`);
  });
  unsubscribeContext();
  contextProvider.dispose();

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
    diagnostic: {
      constantsIdentity: diagnosticsFromSubpath === DIAGNOSTICS,
      type: diagnosticEvent?.type,
      target: diagnosticEvent?.target === element,
      bubbles: diagnosticEvent?.bubbles,
      composed: diagnosticEvent?.composed,
      cancelable: diagnosticEvent?.cancelable,
      defaultPrevented: diagnosticEvent?.defaultPrevented,
      detail: diagnosticEvent?.detail,
    },
    helperSubpaths: {
      domUpdateIdentity: domUpdate === rootDomUpdate,
      emitExtendableIdentity: emitExtendable === rootEmitExtendable,
      updatedSynchronously,
      domUpdateEvent: {
        bubbles: domUpdateEvent?.bubbles,
        cancelable: domUpdateEvent?.cancelable,
        detailIsObject:
          typeof domUpdateEvent?.detail === 'object' &&
          typeof domUpdateEvent?.detail.wrap === 'function',
      },
      extensionSettled,
      extendableEvent: {
        bubbles: extendableEvent?.bubbles,
        cancelable: extendableEvent?.cancelable,
        detailIsObject:
          typeof extendableEvent?.detail === 'object' &&
          typeof extendableEvent?.detail.waitUntil === 'function',
      },
      watchAttributesIdentity: watchAttributes === rootWatchAttributes,
      attributeChanges,
      baseWrappersRemoved:
        !('$domUpdate' in component) &&
        !('$emitExtendable' in component) &&
        !('$viewTransition' in component) &&
        !('$watchAttributes' in component),
    },
    contextSubscription: {
      subpathIdentity: subscribeContext === rootSubscribeContext,
      answers: contextAnswers,
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
