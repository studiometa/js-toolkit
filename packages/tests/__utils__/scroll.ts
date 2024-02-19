import { mock } from 'bun:test';

let scrollHeight: number;

export function mockScroll({ height = 0, width = 0 } = {}) {
  scrollHeight = document.documentElement.scrollHeight;
  const scrollHeightSpy = mock(() => height);
  Object.defineProperties(document.documentElement, {
    scrollHeight: {
      configurable: true,
      get: () => scrollHeightSpy(),
    },
  });

  return { scrollHeightSpy };
}

export function restoreScroll() {
  Object.defineProperties(document.documentElement, {
    scrollHeight: {
      configurable: true,
      value: scrollHeight,
    },
  });
}
