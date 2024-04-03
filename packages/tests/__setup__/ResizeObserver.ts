/**
 * Mock the ResizeObserver constructor.
 */
function resizeObserver(callback: ResizeObserverCallback) {
  const observer = {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
  globalThis.addEventListener('resize', () => callback([], observer));
  return observer;
}

globalThis.ResizeObserver = resizeObserver;
