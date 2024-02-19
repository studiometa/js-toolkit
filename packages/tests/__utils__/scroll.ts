import { mock } from 'bun:test';

let scrollHeight: number;
let scrollWidth: number;
let pageYOffset: number;
let pageXOffset: number;

export function mockScroll({ height = 0, width = 0 } = {}) {
  scrollHeight = document.documentElement.scrollHeight;
  scrollWidth = document.documentElement.scrollWidth;
  pageYOffset = window.pageYOffset;
  pageYOffset = window.pageXOffset;
  let y = 0;
  let x = 0;

  const scrollHeightSpy = mock(() => height);
  const scrollWidthSpy = mock(() => width);

  Object.defineProperties(window, {
    pageYOffset: {
      configurable: true,
      set(value) {
        y = value;
      },
      get() {
        return y;
      },
    },
    pageXOffset: {
      configurable: true,
      set(value) {
        x = value;
      },
      get() {
        return x;
      },
    },
  });

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

  Object.defineProperties(window, {
    pageYOffset: {
      configurable: true,
      value: pageYOffset,
    },
    pageXOffset: {
      configurable: true,
      value: pageXOffset,
    },
  });
}
