/**
 * What it costs to make **every** option responsive.
 *
 * Run with `npx vitest bench --config vitest.bench.config.js` from
 * `packages/v4`. Like the other files here, these answer a design question
 * rather than guard against a regression.
 *
 * Two prices were on the table when the `responsive: true` flag was dropped:
 *
 * 1. **The observer's filter widens.** `attributeFilter` takes exact names, so
 *    a responsive option registers `attribute × breakpoint` — nine names per
 *    option instead of one. Across the ported families that is 33 option
 *    attributes: a filter of 3 + 33 + 8 = **44** names when one option in the
 *    page opted in, and 3 + 33 × 9 = **300** when they all do. A large app is
 *    the same arithmetic on a larger set, so 723 (80 options) is measured too.
 * 2. **Every read walks the cascade.** `$options.foo` was one `getAttribute()`.
 *    It is now the active breakpoint plus up to nine `getAttribute()` calls.
 *
 * The sizes below are the ones the arithmetic produces; the widths are
 * deliberately kept as literals so the curve is readable next to them.
 */
import { bench, describe } from 'vitest';
import { BREAKPOINTS, setBreakpoints } from './services/breakpoint.js';
import { activeBreakpoint, responsiveRawValue } from './responsive-options.js';

/** Keeps each result observable so no benchmark is optimised away. */
declare global {
  // eslint-disable-next-line no-var
  var __benchSink: unknown;
}

setBreakpoints(BREAKPOINTS);

/** The filter widths the change moves between, plus a large-app figure. */
const WIDTHS = [44, 300, 723] as const;

function filterOf(size: number): string[] {
  const names = ['data-component', 'data-mount', 'data-ref'];
  for (let index = names.length; index < size; index += 1) {
    names.push(`data-option-generated-${index}`);
  }
  return names;
}

describe('option read (runs on every `$options.foo`)', () => {
  const el = document.createElement('div');
  el.setAttribute('data-option-columns', '1');
  document.body.append(el);

  const scoped = document.createElement('div');
  scoped.setAttribute('data-option-columns', '1');
  for (const name of Object.keys(BREAKPOINTS)) {
    scoped.setAttribute(`data-option-columns:${name}`, '4');
  }
  document.body.append(scoped);

  const fromElement = (name: string) => el.getAttribute(name);
  const fromScoped = (name: string) => scoped.getAttribute(name);

  // The whole of a plain option's read path before the change.
  bench('plain attribute', () => {
    globalThis.__benchSink = el.getAttribute('data-option-columns');
  });

  // Half of the new read path, measured on its own: eight `MediaQueryList`
  // objects, built once and kept, asked for `.matches`.
  bench('activeBreakpoint() alone', () => {
    globalThis.__benchSink = activeBreakpoint();
  });

  // The new read path at its worst: nothing is scoped, so the walk misses
  // every breakpoint and lands on the base attribute.
  bench('cascade, base attribute only', () => {
    globalThis.__benchSink = responsiveRawValue(
      'data-option-columns',
      activeBreakpoint(),
      fromElement,
    );
  });

  // And at its best: the active breakpoint is scoped, so the walk stops on
  // its first lookup and only `activeBreakpoint()` is left.
  bench('cascade, scoped hit at the active breakpoint', () => {
    globalThis.__benchSink = responsiveRawValue(
      'data-option-columns',
      activeBreakpoint(),
      fromScoped,
    );
  });
});

describe('attributeFilter width — unfiltered write (every `class` write on the page)', () => {
  for (const size of WIDTHS) {
    const observer = new MutationObserver(() => {});
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: filterOf(size),
    });
    const el = document.createElement('div');
    document.body.append(el);
    let counter = 0;

    bench(`${size} names`, () => {
      counter += 1;
      el.setAttribute('class', `is-${counter}`);
      globalThis.__benchSink = observer.takeRecords();
    });
  }
});

describe('attributeFilter width — filtered write (a `data-option-*` rewrite)', () => {
  for (const size of WIDTHS) {
    const observer = new MutationObserver(() => {});
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: filterOf(size),
    });
    const el = document.createElement('div');
    document.body.append(el);
    let counter = 0;

    bench(`${size} names`, () => {
      counter += 1;
      el.setAttribute('data-component', `C${counter}`);
      globalThis.__benchSink = observer.takeRecords();
    });
  }
});

describe('registration — re-observing when the filter grows', () => {
  for (const size of WIDTHS) {
    const observer = new MutationObserver(() => {});
    const names = filterOf(size);

    bench(`${size} names`, () => {
      observer.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: names,
      });
      globalThis.__benchSink = names.length;
    });
  }
});
