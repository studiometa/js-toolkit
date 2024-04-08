import { mock } from 'bun:test';

type Item = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  created: number;
};

/**
 * Thanks to the react-intersecton-observer package for this IntersectionObserver mock!
 *
 * @see https://github.com/thebuilder/react-intersection-observer/blob/master/src/test-utils.ts
 */
const observers: Map<IntersectionObserver, Item> = new Map();

export function beforeAllCallback() {
  /**
   * Create a custom IntersectionObserver mock, allowing us to intercept the observe and unobserve calls.
   * We keep track of the elements being observed, so when `mockAllIsIntersecting` is triggered it will
   * know which elements to trigger the event on.
   */
  globalThis.IntersectionObserver = mock(
    (cb: IntersectionObserverCallback, options: IntersectionObserverInit = {}) => {
      const item: Item = {
        callback: cb,
        elements: new Set(),
        created: Date.now(),
      };
      const instance: IntersectionObserver = {
        thresholds: Array.isArray(options.threshold) ? options.threshold : [options.threshold ?? 0],
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '',
        observe: mock((element: Element) => {
          item.elements.add(element);
        }),
        unobserve: mock((element: Element) => {
          item.elements.delete(element);
        }),
        disconnect: mock(() => {
          observers.delete(instance);
        }),
        takeRecords: mock(),
      };

      observers.set(instance, item);

      return instance;
    },
  );
}

export function afterEachCallback() {
  // @ts-ignore
  globalThis.IntersectionObserver.mockClear();
  observers.clear();
}

function triggerIntersection(
  elements,
  isIntersecting: boolean,
  observer: IntersectionObserver,
  item,
) {
  const entries = [];
  for (const element of elements) {
    entries.push({
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: isIntersecting ? 1 : 0,
      intersectionRect: isIntersecting
        ? element.getBoundingClientRect()
        : {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
            x: 0,
            y: 0,
            toJSON() {},
          },
      isIntersecting,
      rootBounds: observer.root ? (observer.root as Element).getBoundingClientRect() : null,
      target: element,
      time: Date.now() - item.created,
    });
  }

  // Trigger the IntersectionObserver callback with all the entries
  item.callback(entries, observer);
}

/**
 * Call the `intersectionMockInstance` method with an element, to get the (mocked)
 * `IntersectionObserver` instance. You can use this to spy on the `observe` and
 * `unobserve` methods.
 */
export function intersectionMockInstance(element: Element): IntersectionObserver {
  for (const [observer, item] of observers) {
    if (item.elements.has(element)) {
      return observer;
    }
  }

  throw new Error('Failed to find IntersectionObserver for element. Is it being observed?');
}

/**
 * Set the `isIntersecting` for the IntersectionObserver of a specific element.
 */
export function mockIsIntersecting(element: Element, isIntersecting: boolean) {
  const observer = intersectionMockInstance(element);
  if (!observer) {
    throw new Error(
      'No IntersectionObserver instance found for element. Is it still mounted in the DOM?',
    );
  }
  const item = observers.get(observer);
  if (item) {
    triggerIntersection([element], isIntersecting, observer, item);
  }
}
