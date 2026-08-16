/**
 * The blocking profile of mounting a page, v3 against v4.
 *
 * `mount-at-scale.bench.ts` answers "how long until the page is up". This
 * answers the question `SmartQueue` was written for and which a throughput
 * number cannot reach: **while the page comes up, how long is the main thread
 * unavailable?** A version can settle sooner and block worse, or settle later
 * and block not at all, and only reporting both makes that visible.
 *
 * Four numbers per scenario and size:
 *
 * - **settle** — insertion to the Nth `mounted()`.
 * - **quiet** — insertion to a main thread with nothing left to run. The gap
 *   above `settle` is the work each version defers past the last `mounted()`.
 * - **TBT** — total blocking time, the sum of `duration - 50 ms` over every
 *   long task in the window. The standard metric, and precisely what
 *   `SmartQueue` exists to minimise.
 * - **longest / count** — the worst single task and how many crossed 50 ms.
 *   A TBT of zero with a 49 ms task is a very different page from a TBT of
 *   zero with nothing above 5 ms, so the raw longest task is reported too.
 *
 * This runs under `vitest run` rather than `vitest bench`, because tinybench
 * reports one number per benchmark and this needs five. It is a reporter with
 * sanity assertions, not a gate: see the pull request for why a cross-version
 * blocking assertion is a bad hard gate.
 */
import { describe, expect, it } from 'vitest';
import {
  VERSIONS,
  buildPool,
  clearDocument,
  expectedMounts,
  mountedSoFar,
  registerScenario,
  releaseDocumentFromV3,
  whenMainThreadQuiet,
  whenMounted,
  type ScenarioName,
  type Version,
} from './mount-at-scale.fixtures.js';

/** Injected by `vitest.bench.config.ts` from `V3_BENCH_SIZES`. */
declare const __BENCH_SIZES__: number[];

const SIZES = __BENCH_SIZES__;
const SCENARIOS: ScenarioName[] = ['control', 'flat', 'nested', 'realistic'];

/** Repeats per cell. The median of five, so one GC pause is not the headline. */
const REPEATS = 5;

/** A task blocks once it passes 50 ms; TBT counts only the excess. */
const LONG_TASK_MS = 50;

interface Sample {
  settle: number;
  quiet: number;
  blocking: number;
  longest: number;
  longTasks: number;
}

interface Row extends Sample {
  version: Version;
  scenario: ScenarioName;
  size: number;
}

const rows: Row[] = [];

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Collect `longtask` entries. The observer callback fires in a later task, so
 * entries are drained with `takeRecords()` as well: anything still undelivered
 * when the window closes would otherwise be lost.
 */
function watchLongTasks() {
  const entries: PerformanceEntry[] = [];
  const observer = new PerformanceObserver((list) => entries.push(...list.getEntries()));
  observer.observe({ type: 'longtask', buffered: false });

  return {
    /** Long tasks that started at or after `since`, then stop observing. */
    stop(since: number) {
      entries.push(...observer.takeRecords());
      observer.disconnect();
      return entries.filter((entry) => entry.startTime >= since);
    },
  };
}

/** One swap, measured end to end. */
async function measureSwap(
  previous: HTMLElement,
  next: HTMLElement,
  expected: number,
): Promise<Sample> {
  const mounted = whenMounted(expected);
  const watcher = watchLongTasks();
  const start = performance.now();

  previous.remove();
  document.body.append(next);
  await mounted;
  const settle = performance.now() - start;

  await whenMainThreadQuiet();
  const quiet = performance.now() - start;

  const durations = watcher.stop(start).map((entry) => entry.duration);
  return {
    settle,
    quiet,
    blocking: durations.reduce(
      (total, duration) => total + Math.max(0, duration - LONG_TASK_MS),
      0,
    ),
    longest: Math.max(0, ...durations),
    longTasks: durations.length,
  };
}

async function profile(version: Version, scenario: ScenarioName, size: number): Promise<void> {
  await clearDocument();
  if (version === 'v4') {
    releaseDocumentFromV3();
  }
  await registerScenario(version, scenario);

  const expected = expectedMounts(scenario, size);
  const pool = buildPool(VERSIONS[version][scenario](size), REPEATS + 1);

  // Seed the page, so every measured swap replaces a page of the same weight.
  const seeded = whenMounted(expected);
  document.body.append(pool[0]);
  await seeded;
  await whenMainThreadQuiet();

  const samples: Sample[] = [];
  for (let index = 1; index <= REPEATS; index += 1) {
    samples.push(await measureSwap(pool[index - 1], pool[index], expected));
    // The measurement is only meaningful if the page really came up.
    expect(mountedSoFar()).toBe(expected);
  }

  rows.push({
    version,
    scenario,
    size,
    settle: median(samples.map((sample) => sample.settle)),
    quiet: median(samples.map((sample) => sample.quiet)),
    blocking: median(samples.map((sample) => sample.blocking)),
    longest: median(samples.map((sample) => sample.longest)),
    longTasks: median(samples.map((sample) => sample.longTasks)),
  });

  await clearDocument();
}

function ms(value: number): string {
  return value >= 100 ? value.toFixed(0) : value.toFixed(2);
}

function report(): string {
  const lines = [
    '',
    '| scenario | size | version | settle (ms) | quiet (ms) | TBT (ms) | longest task (ms) | long tasks |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const size of SIZES) {
    for (const scenario of SCENARIOS) {
      for (const version of ['v3', 'v4'] as const) {
        const row = rows.find(
          (candidate) =>
            candidate.size === size &&
            candidate.scenario === scenario &&
            candidate.version === version,
        );
        if (!row) {
          continue;
        }
        // The control mounts nothing, so its settle time is the arming call
        // and says nothing. Its cost is entirely in reaching a quiet thread.
        const settle = scenario === 'control' ? '—' : ms(row.settle);
        lines.push(
          `| ${scenario} | ${size} | ${version} | ${settle} | ${ms(row.quiet)} | ${ms(row.blocking)} | ${ms(row.longest)} | ${row.longTasks} |`,
        );
      }
    }
  }

  return lines.join('\n');
}

// v3 has to go first: the two versions collide on `el.__base__`, and only v3's
// registry can be emptied afterwards. See `registerScenario()`.
describe.sequential('mount-at-scale blocking profile', () => {
  for (const version of ['v3', 'v4'] as const) {
    for (const size of SIZES) {
      for (const scenario of SCENARIOS) {
        it(`${version} ${scenario} ${size}`, { timeout: 120_000 }, async () => {
          await profile(version, scenario, size);
        });
      }
    }
  }

  // A test rather than `afterAll`, because vitest only forwards the browser's
  // console output for a running task.
  it('reports', () => {
    expect(rows).toHaveLength(SIZES.length * SCENARIOS.length * 2);
    // eslint-disable-next-line no-console
    console.log(report());
  });
});
