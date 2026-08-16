/**
 * Mounting throughput at page scale, v3 and v4, in one browser session.
 *
 * Two questions, one measurement:
 *
 * 1. **Per version, over time.** Each `bench` is tracked on its own by
 *    `.github/actions/bench-diff`, which divides by the count in the group
 *    title to report a per-component cost.
 * 2. **Between versions, now.** Both run on the same runner, in the same
 *    browser, minutes apart, which is as close to a controlled comparison as
 *    two frameworks that cannot share a document will get.
 *
 * Each version is driven through its **own native path** — v3's document
 * mutation observer feeding `SmartQueue`, v4's observer feeding its
 * scheduler. That difference is the subject, not a nuisance, so nothing here
 * normalises it away. What is identical is the definition of done, in
 * `mount-at-scale.fixtures.ts`: the Nth `mounted()` call, then a quiet main
 * thread — observed from the components, so neither framework's own settle
 * API gets to define away work it defers.
 *
 * **The versions take turns**, v3 first, because they collide on
 * `el.__base__`; see `registerScenario()`. They are therefore in separate
 * groups, and the ratio is read from the report rather than from vitest's
 * per-group summary.
 *
 * Wall clock alone cannot answer the question `SmartQueue` was written for.
 * `mount-at-scale.profile.ts` reports the blocking profile — total blocking
 * time, longest task, long-task count — over the same scenarios.
 *
 * **Every iteration swaps one page for another**, rather than appending to a
 * growing one. v3's registry rescans the whole document on every mutation
 * while v4 walks the inserted subtree only, so a document that grew across a
 * cycle would charge v3 for the benchmark's own bookkeeping. Swapping keeps
 * exactly `size` components in the document at every measurement, at the cost
 * of measuring a destroy alongside each mount — which the `destroy` groups
 * price separately.
 */
import { bench, describe } from 'vitest';
import {
  VERSIONS,
  buildPool,
  clearDocument,
  expectedMounts,
  registerScenario,
  releaseDocumentFromV3,
  whenDestroyed,
  whenMainThreadQuiet,
  whenMounted,
  type ScenarioName,
  type Version,
} from './mount-at-scale.fixtures.js';

/** Injected by `vitest.bench.config.ts` from `V3_BENCH_SIZES`. */
declare const __BENCH_SIZES__: number[];

/** The page weights the two designs have to hold up under. */
const SIZES = __BENCH_SIZES__;

/**
 * Sample counts, not sample time. v3 settles a page of a thousand components
 * in tens of milliseconds, so tinybench's 500 ms default would stop at its
 * ten-iteration floor for the small sizes and take minutes for the large
 * ones. A fixed count keeps every size comparably sampled and the suite
 * bounded.
 */
function samplesFor(size: number) {
  return {
    time: 0,
    iterations: size >= 1000 ? 7 : size >= 500 ? 9 : 13,
    warmupTime: 0,
    warmupIterations: 1,
  };
}

/** Give the document to the version this group measures. */
async function claimDocument(version: Version, scenario: ScenarioName): Promise<void> {
  await clearDocument();
  if (version === 'v4') {
    releaseDocumentFromV3();
  }
  await registerScenario(version, scenario);
}

/**
 * Swap the page for an identical one and wait for it to settle.
 *
 * Trees are cloned in the per-cycle `setup` hook, never in the timed body:
 * vitest exposes no per-iteration hook, so anything the body touches is
 * measured, and parsing markup costs more than mounting it.
 */
function swapBench(version: Version, scenario: ScenarioName, size: number): void {
  const options = samplesFor(size);
  const expected = expectedMounts(scenario, size);
  let pool: HTMLElement[] = [];
  let index = 1;

  bench(
    `${version} — ${scenario}`,
    async () => {
      // Armed before the DOM is touched, so a synchronous mount cannot slip
      // past the counter.
      const mounted = whenMounted(expected);
      pool[index - 1].remove();
      document.body.append(pool[index]);
      index += 1;
      await mounted;
      await whenMainThreadQuiet();
    },
    {
      ...options,
      async setup() {
        await claimDocument(version, scenario);
        pool = buildPool(VERSIONS[version][scenario](size), options.iterations + 2);
        // Seed the document so the first timed iteration is a swap like every
        // other one, instead of an insertion into an empty page.
        const mounted = whenMounted(expected);
        document.body.append(pool[0]);
        await mounted;
        await whenMainThreadQuiet();
        index = 1;
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

/**
 * Removal on its own, so a swap reads as "mount plus this". The pool is
 * mounted whole in `setup` and removed one host per iteration, so the
 * document shrinks across a cycle — which costs v3 less as it goes, since its
 * rescan is document-wide. The median lands mid-cycle, on a page of about
 * half the pool.
 */
function destroyBench(version: Version, size: number): void {
  // Fewer iterations than a swap group: the whole pool is mounted at once, so
  // the count sets how heavy the starting page is, and v3 cannot afford a
  // heavy one — its queue drains with `Array#shift`, which V8 turns quadratic
  // past ~16 000 entries.
  const base = samplesFor(size);
  const options = { ...base, iterations: Math.min(base.iterations, 5) };
  let pool: HTMLElement[] = [];
  let index = 0;

  bench(
    `${version} — destroy`,
    async () => {
      const destroyed = whenDestroyed(size);
      pool[index].remove();
      index += 1;
      await destroyed;
      await whenMainThreadQuiet();
    },
    {
      ...options,
      async setup() {
        await claimDocument(version, 'flat');
        pool = buildPool(VERSIONS[version].flat(size), options.iterations + 1);
        const mounted = whenMounted(size * pool.length);
        for (const host of pool) {
          document.body.append(host);
        }
        await mounted;
        await whenMainThreadQuiet();
        index = 0;
      },
      teardown() {
        document.body.replaceChildren();
        pool = [];
      },
    },
  );
}

/**
 * Every group for one version, in one block. Order is what keeps the two
 * apart: vitest runs suites in declaration order, so v3 is finished with the
 * document before v4 registers anything.
 */
function defineVersion(version: Version): void {
  for (const size of SIZES) {
    describe(`swap ${size} components — ${version}`, () => {
      swapBench(version, 'control', size);
      swapBench(version, 'flat', size);
      swapBench(version, 'nested', size);
      swapBench(version, 'realistic', size);
    });

    describe(`destroy ${size} flat components — ${version}`, () => {
      destroyBench(version, size);
    });
  }
}

defineVersion('v3');
defineVersion('v4');
