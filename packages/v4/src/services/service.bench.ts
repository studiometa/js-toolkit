/** Run with `npx vitest bench --config vitest.bench.config.js` from `packages/v4`. */
import { bench, describe } from 'vitest';
import { BREAKPOINTS } from './breakpoint.js';
import { createService } from './service.js';

/** Keeps each result observable so no benchmark is optimised away. */
declare global {
  // eslint-disable-next-line no-var
  var __benchSink: unknown;
}

describe('breakpoint resolution (runs on every resize)', () => {
  const entries = Object.entries(BREAKPOINTS);

  bench('matchMedia per breakpoint, per resize', () => {
    let match = '';
    for (const [name, value] of entries) {
      if (window.matchMedia(`(min-width: ${value})`).matches) {
        match = name;
      }
    }
    globalThis.__benchSink = match;
  });

  const queries = entries.map(
    ([name, value]) => [name, window.matchMedia(`(min-width: ${value})`)] as const,
  );
  bench('persistent MediaQueryList', () => {
    let match = '';
    for (const [name, query] of queries) {
      if (query.matches) {
        match = name;
      }
    }
    globalThis.__benchSink = match;
  });

  const widths = entries.map(([name, value]) => [name, Number.parseFloat(value) * 16] as const);
  bench('width comparison', () => {
    let match = '';
    for (const [name, width] of widths) {
      if (window.innerWidth >= width) {
        match = name;
      }
    }
    globalThis.__benchSink = match;
  });
});

/** Measures observer setup and teardown, not steady-state idle cost. */
describe('observer sharing: one observer, N targets vs N observers', () => {
  const targets = Array.from({ length: 50 }, () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:10px;height:10px';
    document.body.append(el);
    return el;
  });

  bench('one ResizeObserver observing 50 targets', () => {
    const observer = new ResizeObserver(() => {});
    for (const target of targets) {
      observer.observe(target);
    }
    observer.disconnect();
  });

  bench('50 ResizeObservers, one target each', () => {
    const observers = targets.map((target) => {
      const observer = new ResizeObserver(() => {});
      observer.observe(target);
      return observer;
    });
    for (const observer of observers) {
      observer.disconnect();
    }
  });
});

describe('subscription overhead', () => {
  const service = createService<number>({
    props: () => 0,
    start: () => () => {},
  });

  bench('service add + unsubscribe', () => {
    service.subscribe(() => {})();
  });

  // One AbortController per subscription.
  bench('addEventListener with AbortSignal', () => {
    const controller = new AbortController();
    window.addEventListener('resize', () => {}, { signal: controller.signal });
    controller.abort();
  });

  bench('addEventListener + removeEventListener', () => {
    const callback = () => {};
    window.addEventListener('resize', callback);
    window.removeEventListener('resize', callback);
  });
});

describe('fan-out to subscribers', () => {
  for (const count of [1, 10, 100]) {
    const service = createService<{ time: number }>({
      props: () => ({ time: 0 }),
      start: () => () => {},
    });
    for (let i = 0; i < count; i += 1) {
      service.subscribe(() => {});
    }
    // Mirror the private fan-out shape.
    const callbacks = Array.from({ length: count }, () => () => {});
    bench(`${count} subscriber(s), try/catch each`, () => {
      const results: unknown[] = [];
      for (const callback of callbacks) {
        try {
          results.push(callback());
        } catch {
          /* Diagnostic reporting is outside this benchmark. */
        }
      }
      globalThis.__benchSink = results;
    });
  }
});
