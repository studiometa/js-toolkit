import { jest } from '@jest/globals';

let shouldMock = true;

export function mockBreakpoints() {
  shouldMock = true;
}

export function unmockBreakpoints() {
  shouldMock = false;
}

/**
 * Global mock for the breakpoints detection used by the `resize` service.
 */
Object.defineProperty(globalThis, 'getComputedStyle', {
  writable: true,
  value: jest.fn().mockImplementation((element, pseudoElement) => {
    let content = 's,m,l';

    if (pseudoElement === '::before') {
      if (globalThis.innerWidth < 768) {
        content = 's';
      } else if (globalThis.innerWidth >= 768 && globalThis.innerWidth < 1024) {
        content = 'm';
      } else {
        content = 'l';
      }
    }

    if (!shouldMock) {
      content = '';
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
