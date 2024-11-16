import { vi } from 'vitest';

const map = new Map<HTMLElement | Window, [number, number, number, number]>();

type Params = Partial<{
  height: number;
  width: number;
  left: number;
  top: number;
  element: HTMLElement | Window;
}>

export function mockScroll({
  height = 0,
  width = 0,
  left = 0,
  top = 0,
  element = document.documentElement,
}: Params = {}) {
  map.set(element, [
    element.scrollHeight,
    element.scrollWidth,
    element.scrollTop,
    element.scrollLeft,
  ]);
  const scrollHeightSpy = vi.fn(() => height);
  const scrollWidthSpy = vi.fn(() => width);
  const scroll = { left, top };
  const scrollLeftSpy = vi.fn(() => scroll.left);
  const scrollTopSpy = vi.fn(() => scroll.top);
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
    scrollX: {
      configurable: true,
      get: () => scrollLeftSpy(),
    },
    scrollTop: {
      configurable: true,
      get: () => scrollTopSpy(),
    },
    scrollY: {
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
