/**
 * Mock the ResizeObserver constructor.
 * @param {Function} callback
 */
function ResizeObserver(callback) {
  globalThis.addEventListener('resize', () => callback());
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
}

globalThis.ResizeObserver = ResizeObserver;
