/** Benchmark responsive option reads and `MutationObserver` filter widths. */
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

/** Reads in one task: twenty instances reading one option, or four reading five. */
const READS = 20;

function filterOf(size: number): string[] {
  const names = ['data-component', 'data-mount', 'data-ref'];
  for (let index = names.length; index < size; index += 1) {
    names.push(`data-option-generated-${index}`);
  }
  return names;
}

/** The runner crosses a microtask between cold-read iterations. */
describe('option read, cold (the first read of a task)', () => {
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

  bench('plain attribute', () => {
    globalThis.__benchSink = el.getAttribute('data-option-columns');
  });

  // Measure the media-query sweep separately.
  bench('activeBreakpoint() alone', () => {
    globalThis.__benchSink = activeBreakpoint();
  });

  // Measure a cascade miss through every breakpoint.
  bench('cascade, base attribute only', () => {
    globalThis.__benchSink = responsiveRawValue(
      'data-option-columns',
      activeBreakpoint(),
      fromElement,
    );
  });

  // Measure a cascade hit at the active breakpoint.
  bench('cascade, scoped hit at the active breakpoint', () => {
    globalThis.__benchSink = responsiveRawValue(
      'data-option-columns',
      activeBreakpoint(),
      fromScoped,
    );
  });
});

/** Measure repeated option reads within one task. */
describe(`option read, batched (${READS} reads in one task)`, () => {
  const el = document.createElement('div');
  el.setAttribute('data-option-columns', '1');
  document.body.append(el);
  const fromElement = (name: string) => el.getAttribute(name);

  bench(`plain attribute × ${READS}`, () => {
    let last: string | null = null;
    for (let index = 0; index < READS; index += 1) {
      last = el.getAttribute('data-option-columns');
    }
    globalThis.__benchSink = last;
  });

  // Inline the non-memoized media-query sweep for direct comparison.
  const queries = Object.entries(BREAKPOINTS).map(
    ([name, value]) => [name, window.matchMedia(`(min-width: ${value})`)] as const,
  );
  const sweep = (): string => {
    let match = '';
    for (const [name, query] of queries) {
      if (query.matches) {
        match = name;
      }
    }
    return match;
  };

  bench(`cascade × ${READS}, breakpoint swept per read (before)`, () => {
    let last: string | null = null;
    for (let index = 0; index < READS; index += 1) {
      last = responsiveRawValue('data-option-columns', sweep(), fromElement);
    }
    globalThis.__benchSink = last;
  });

  bench(`cascade × ${READS}, breakpoint memoised per task (after)`, () => {
    let last: string | null = null;
    for (let index = 0; index < READS; index += 1) {
      last = responsiveRawValue('data-option-columns', activeBreakpoint(), fromElement);
    }
    globalThis.__benchSink = last;
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
