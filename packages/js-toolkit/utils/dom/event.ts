function event(
  mode: 'add',
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): void;
function event(
  mode: 'remove',
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
): void;
function event(
  mode: 'add' | 'remove',
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions | AddEventListenerOptions,
) {
  target[`${mode}EventListener`](event, callback, options);
}

function on(
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): () => void;
function on(...args: [EventTarget, string, EventListenerOrEventListenerObject]): () => void {
  event('add', ...args);
  return () => off(...args);
}

function off(
  target: EventTarget,
  event: string,
  callback: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions,
): void;
function off(...args: [EventTarget, string, EventListenerOrEventListenerObject]): void {
  event('remove', ...args);
}

export function emit(target: EventTarget, event: Event): void {
  target.dispatchEvent(event);
}

export { on, off };
