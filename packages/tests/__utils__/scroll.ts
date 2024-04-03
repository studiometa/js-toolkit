import { mock } from 'bun:test';

let scrollHeight: number;
let scrollWidth: number;

export function mockScroll({ height = 0, width = 0 } = {}) {
  scrollHeight = document.documentElement.scrollHeight;
  scrollWidth = document.documentElement.scrollWidth;
  const scrollHeightSpy = mock(() => height);
  const scrollWidthSpy = mock(() => width);
  Object.defineProperties(document.documentElement, {
    scrollHeight: {
      configurable: true,
      get: () => scrollHeightSpy(),
    },
    scrollWidth: {
      configurable: true,
      get: () => scrollWidthSpy(),
    },
  });

  return { scrollHeightSpy, scrollWidthSpy };
}

export function restoreScroll() {
  Object.defineProperties(document.documentElement, {
    scrollHeight: {
      configurable: true,
      value: scrollHeight,
    },
    scrollWidth: {
      configurable: true,
      value: scrollWidth,
    },
  });
}
