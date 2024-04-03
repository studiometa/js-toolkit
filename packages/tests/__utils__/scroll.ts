import { mock } from 'bun:test';

const map = new Map<HTMLElement, [number, number, number, number]>();

export function mockScroll({
  height = 0,
  width = 0,
  left = 0,
  top = 0,
  element = document.documentElement,
} = {}) {
  map.set(element, [
    element.scrollHeight,
    element.scrollWidth,
    element.scrollTop,
    element.scrollLeft,
  ]);
  const scrollHeightSpy = mock(() => height);
  const scrollWidthSpy = mock(() => width);
  const scroll = { left, top };
  const scrollLeftSpy = mock(() => scroll.left);
  const scrollTopSpy = mock(() => scroll.top);
  Object.defineProperties(element, {
    scrollHeight: {
      configurable: true,
      get: () => scrollHeightSpy(),
    },
    scrollWidth: {
      configurable: true,
      get: () => scrollWidthSpy(),
    },
    scrollLeft: {
      configurable: true,
      get: () => scrollLeftSpy(),
    },
    scrollTop: {
      configurable: true,
      get: () => scrollTopSpy(),
    },
    scrollTo: {
      configurable: true,
      value: (position) => {
        scroll.left = position.left;
        scroll.top = position.top;
      },
    },
  });

  return { scrollHeightSpy, scrollWidthSpy, scrollLeftSpy, scrollTopSpy };
}

export function restoreScroll(element = document.documentElement) {
  const [scrollHeight, scrollWidth, scrollTop, scrollLeft] = map.get(element);
  Object.defineProperties(element, {
    scrollHeight: {
      configurable: true,
      value: scrollHeight,
    },
    scrollWidth: {
      configurable: true,
      value: scrollWidth,
    },
    scrollTop: {
      configurable: true,
      value: scrollTop,
    },
    scrollLeft: {
      configurable: true,
      value: scrollLeft,
    },
  });
}
