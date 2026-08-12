/**
 * Measurements behind the open questions on the services design.
 *
 * Run with `npx vitest bench --config vitest.bench.config.js` from
 * `packages/v4`. These are not part of the CodSpeed suite: they answer
 * design questions rather than guard against regressions.
 */
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

  // What ResizeService does today: a MediaQueryList is constructed for
  // every breakpoint, on every resize.
  bench('matchMedia per breakpoint, per resize', () => {
    let match = '';
    for (const [name, value] of entries) {
      if (window.matchMedia(`(min-width: ${value})`).matches) {
        match = name;
      }
    }
    globalThis.__benchSink = match;
  });

  // The same answer from lists built once.
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

  // Or simply comparing widths, since these are all `min-width`.
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

/**
 * Note what this does and does not measure: it times *setup churn* —
 * constructing, observing and disconnecting — not the steady-state cost of
 * observers sitting idle. The often-repeated "one shared ResizeObserver is
 * astoundingly more performant" claim traces to a single 2017 blink-dev
 * measurement; a 2026 re-measurement puts idle cost at 0.02 ms/frame for
 * 500 observers, with grouping making no measurable difference. So this
 * number is not an argument for sharing observers on performance grounds —
 * share them for lifecycle bookkeeping instead.
 */
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
    service.add(() => {})();
  });

  // One AbortController *per subscription* — which is not the same thing
  // as one signal per component, and is the only variant this rules out.
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
      service.add(() => {});
    }
    // Reaching the private emit is not possible from outside, so this
    // mirrors its shape: a try/catch per subscriber, collecting returns.
    const callbacks = Array.from({ length: count }, () => () => {});
    bench(`${count} subscriber(s), try/catch each`, () => {
      const results: unknown[] = [];
      for (const callback of callbacks) {
        try {
          results.push(callback());
        } catch {
          /* reported in the real implementation */
        }
      }
      globalThis.__benchSink = results;
    });
  }
});
