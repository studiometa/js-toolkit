/**
 * Mock the ResizeObserver constructor.
 * @param {Function} callback
 */
function ResizeObserver(callback) {
  window.addEventListener('resize', () => callback());
  return {
    observe: () => {},
    unobserve: () => {},
    disconnect: () => {},
  };
}

window.ResizeObserver = ResizeObserver;
