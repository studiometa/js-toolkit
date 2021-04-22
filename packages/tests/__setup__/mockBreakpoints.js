import { jest } from '@jest/globals';

/**
 * Global mock for the breakpoints detection used by the `resize` service.
 */
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation((element, pseudoElement) => {
    let content = 's,m,l';

    if (pseudoElement === '::before') {
      if (window.innerWidth < 768) {
        content = 's';
      } else if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        content = 'm';
      } else {
        content = 'l';
      }
    }

    return {
      content,
      transitionDuration: element.style.transitionDuration,
      getPropertyValue(key) {
        return this[key];
      },
    };
  }),
});
