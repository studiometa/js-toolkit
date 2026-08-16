/**
 * Mounting throughput at page scale.
 *
 * `mount.bench.ts` measures one instance; this measures a page of them. The
 * quantity that matters is not the total but the cost per component, and
 * whether it stays flat as the count grows — `.github/actions/bench-diff`
 * divides each result by the count in its group title to report it.
 *
 * Every number here is a settle time, from the DOM write to
 * `whenDOMSettled()`. It is not a blocking time: eager mounts are posted one
 * background task per element and drained inside the scheduler's 5 ms budget.
 * `mount-at-scale.spec.ts` guards the part that does block.
 */
import { bench, describe } from 'vitest';
import { whenDOMSettled } from './dom-mutations.js';
import {
  buildPool,
  clearDocument,
  registerScaleComponents,
  scenarios,
  type ScenarioName,
} from './mount-at-scale.fixtures.js';

registerScaleComponents();

/** Injected by `vitest.bench.config.js` from `V4_BENCH_SIZES`. */
declare const __BENCH_SIZES__: number[];

/** The page weights the design has to hold up under. */
const SIZES = __BENCH_SIZES__;

/** Arrivals for the batching comparison — one morph per chunk. */
const BATCHES = 10;

/**
 * Sample counts, not sample time: 5 000 realistic components take ~500 ms to
 * settle, so tinybench's 500 ms default would stop at its ten-iteration floor
 * for the small sizes and at one sample for the large ones. Fixing the count
 * keeps every size comparably sampled and the suite bounded.
 */
function samplesFor(size: number) {
  return {
    time: 0,
    iterations: size >= 5000 ? 9 : size >= 1000 ? 13 : 17,
    warmupTime: 0,
    warmupIterations: 1,
  };
}

/**
 * Insert a prebuilt tree and wait for the registry to finish with it.
 *
 * Trees are cloned in the per-cycle `setup` hook, never in the timed body:
 * vitest exposes no per-iteration hook, so anything the body touches is
 * measured. Hosts accumulate across a cycle's iterations, which is harmless —
 * the registry scans the inserted subtree only, never the document.
 */
function mountBench(label: string, scenario: ScenarioName, size: number): void {
  const options = samplesFor(size);
  let pool: HTMLElement[] = [];
  let index = 0;

  bench(
    label,
    async () => {
      document.body.append(pool[index]);
      index += 1;
      await whenDOMSettled();
    },
    {
      ...options,
      async setup() {
        await clearDocument();
        pool = buildPool(scenarios[scenario](size), options.iterations + 1);
        index = 0;
      },
      // Drop the cycle's trees so the next benchmark does not start under the
      // heap pressure this one left behind.
      teardown() {
        document.body.replaceChildren();
        pool = [];
      },
    },
  );
}

describe.each(SIZES)('mount %i components, one insertion', (size) => {
  mountBench('control — declared but unregistered', 'control', size);
  mountBench('flat', 'flat', size);
  mountBench('nested 4 deep', 'nested', size);
  mountBench('realistic — 5 refs, 3 options, 4 handlers', 'realistic', size);
  mountBench('in-view — one controller per element', 'inView', size);
  mountBench('responsive option — breakpoint cascade per mount', 'responsive', size);
});

describe.each(SIZES)(`mount %i flat components, 1 vs ${BATCHES} insertions`, (size) => {
  const options = samplesFor(size);
  let pool: HTMLElement[][] = [];
  let index = 0;

  mountBench('1 insertion', 'flat', size);

  bench(
    `${BATCHES} insertions`,
    async () => {
      for (const chunk of pool[index]) {
        document.body.append(chunk);
        // Settling per chunk is what makes them separate observer deliveries.
        await whenDOMSettled();
      }
      index += 1;
    },
    {
      ...options,
      async setup() {
        await clearDocument();
        pool = Array.from({ length: options.iterations + 1 }, () =>
          buildPool(scenarios.flat(Math.ceil(size / BATCHES)), BATCHES),
        );
        index = 0;
      },
      teardown() {
        document.body.replaceChildren();
        pool = [];
      },
    },
  );
});

describe.each(SIZES)('destroy %i flat components, one removal', (size) => {
  const options = samplesFor(size);
  let pool: HTMLElement[] = [];
  let index = 0;

  bench(
    'flat',
    async () => {
      pool[index].remove();
      index += 1;
      await whenDOMSettled();
    },
    {
      ...options,
      async setup() {
        await clearDocument();
        pool = buildPool(scenarios.flat(size), options.iterations + 1);
        for (const host of pool) {
          document.body.append(host);
        }
        await whenDOMSettled();
        index = 0;
      },
      teardown() {
        document.body.replaceChildren();
        pool = [];
      },
    },
  );
});
