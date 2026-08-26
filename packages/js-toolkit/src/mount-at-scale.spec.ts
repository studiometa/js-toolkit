/**
 * Blocking guards for mounting at page scale.
 *
 * `mount-at-scale.bench.ts` reports a number; this file fails the build.
 *
 * What is guarded, and why these shapes. Eager mounting is already
 * time-sliced: `applyMountStrategy()` posts one background task per element
 * and the scheduler's 5 ms budget bounds each turn. What is *not* sliced is
 * the observer batch itself — `processMutations()` scans an inserted subtree
 * and tears down a removed one in one synchronous pass, so the blocking cost
 * of a page grows with its DOM node count, not with how heavy its components
 * are. That pass is what these guards defend.
 *
 * Measured in this Chromium, best of three, on a developer machine:
 *
 * | insertion          | settle | longest task |
 * | ------------------ | ------ | ------------ |
 * | 10 000 flat        | 178 ms | none         |
 * | 12 000 flat        | 199 ms | 51 ms        |
 * | 2 000 realistic    | 181 ms | none         |
 * | 4 000 realistic    | 363 ms | 59 ms        |
 * | remove 10 000 flat |  40 ms | none         |
 * | remove 15 000 flat |  61 ms | 53 ms        |
 *
 * So the long-task cliff sits near 12 000 inserted DOM nodes and near 13 000
 * removed ones. The guards below stay well under it rather than asserting the
 * cliff itself: a faster machine would never reach it, a slower one would
 * reach it early, and an assertion that depends on the runner's speed is a
 * flake. The one guard that does not depend on machine speed — a ratio — is
 * where the tight threshold goes.
 *
 * Every threshold tolerates noise, because a CI runner is slower and noisier
 * than this machine and a guard that flakes gets deleted by the next person,
 * which is worse than no guard. Each signal tolerates it in the way that
 * suits it: wall time takes the best of several repeats, a long task takes
 * the second worst. `mountCost()` explains why they differ.
 */
import { describe, expect, it } from 'vitest';
import { whenDOMSettled } from './dom-mutations.js';
import {
  buildPool,
  clearDocument,
  registerScaleComponents,
  scenarios,
} from './mount-at-scale.fixtures.js';

registerScaleComponents();

/**
 * Repeats per measurement, so one scheduling hiccup cannot fail the build.
 * Must stay at two or more: the long-task reduction below discards the worst
 * repeat and reads the one behind it.
 */
const REPEATS = 4;

/**
 * A catastrophe ceiling on wall time, not a regression detector: a shared
 * runner's wall clock is too soft for that, and the bench-diff job owns it.
 * Roughly 8× the local best, past any plausible runner handicap and still
 * short of the order-of-magnitude blow-up this is here to catch.
 */
const SETTLE_CEILING = 400;

interface MountCost {
  /** Wall time from the DOM write to `whenDOMSettled()`. */
  duration: number;
  /** The longest `longtask` entry the write produced, or 0 for none. */
  longestTask: number;
}

/** Watch for long tasks while `work` runs, and report the longest one. */
async function watchLongTasks(work: () => Promise<void>): Promise<MountCost> {
  const durations: number[] = [];
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      durations.push(entry.duration);
    }
  });
  observer.observe({ entryTypes: ['longtask'] });

  const start = performance.now();
  await work();
  const duration = performance.now() - start;

  // Long-task entries are queued and delivered on a later task.
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  for (const entry of observer.takeRecords()) {
    durations.push(entry.duration);
  }
  observer.disconnect();

  return { duration, longestTask: Math.max(0, ...durations) };
}

/**
 * Insert one tree and wait for the registry to finish with it. The tree is
 * built before the clock starts, so parsing markup is never counted as
 * framework work.
 */
async function mountOnce(html: string): Promise<MountCost> {
  const [host] = buildPool(html, 1);
  const cost = await watchLongTasks(async () => {
    document.body.append(host);
    await whenDOMSettled();
  });
  await clearDocument();
  return cost;
}

/**
 * Run the measurement `REPEATS` times, after one unmeasured run warms the
 * paths, and reduce the repeats — differently for each signal, because they
 * are different kinds of number.
 *
 * **Wall time takes the minimum.** It is a cost, and the least interrupted
 * run is the closest any of them gets to the cost of the work itself. Every
 * other repeat measured that same work plus something else.
 *
 * **A long task takes the second worst.** It is a defect, not a cost: any
 * occurrence is the finding, so the minimum is exactly wrong — one lucky
 * repeat out of four would hide a page that blocks the main thread three
 * times out of four. The maximum is wrong in the other direction, because a
 * `longtask` entry attributes *any* 50 ms task in the frame, including a GC
 * pause or a runner hiccup that has nothing to do with mounting, and one of
 * those would fail the build. Discarding only the single worst repeat keeps
 * the signal — a page that really blocks does so on every repeat — while
 * forgiving one bad sample. One blocked run is noise; two is the finding.
 *
 * Tolerating noise in *how many repeats blocked*, rather than by allowing
 * some blocking, is what keeps the assertion honest: it still reads "no long
 * task", never "no long task longer than N".
 */
async function mountCost(html: string): Promise<MountCost> {
  await mountOnce(html);
  const runs: MountCost[] = [];
  for (let index = 0; index < REPEATS; index += 1) {
    runs.push(await mountOnce(html));
  }
  const blocked = runs.map((run) => run.longestTask).sort((a, b) => a - b);
  return {
    duration: Math.min(...runs.map((run) => run.duration)),
    // The second worst, so the single worst repeat is discarded.
    longestTask: blocked[blocked.length - 2],
  };
}

/**
 * Measure two pages against each other and return `b / a`, the ratio of their
 * best wall times.
 *
 * The two sides are measured **alternately**, not one after the other. A
 * ratio of two separately-taken measurements absorbs every bit of drift
 * between the two blocks: a CI runner that slows down between them reports it
 * as a difference between the pages. Nesting read 1.91 that way on
 * `ubuntu-latest` while the benchmark suite, which interleaves, put the same
 * pair at 1.01 on the same runner class. Alternating puts any drift on both
 * sides, which is the same reason `bench-diff` alternates base and head.
 */
async function costRatio(a: string, b: string): Promise<number> {
  await mountOnce(a);
  await mountOnce(b);
  const first: number[] = [];
  const second: number[] = [];
  for (let index = 0; index < REPEATS; index += 1) {
    first.push((await mountOnce(a)).duration);
    second.push((await mountOnce(b)).duration);
  }
  return Math.min(...second) / Math.min(...first);
}

describe('mounting at page scale', () => {
  // 500 realistic components is a heavy real page. Its un-chunked pass costs
  // ~7 ms here, so reaching 50 ms needs a machine seven times slower.
  it('mounts 500 realistic components without blocking', async () => {
    const cost = await mountCost(scenarios.realistic(500));
    expect(cost.longestTask).toBe(0);
    expect(cost.duration).toBeLessThan(SETTLE_CEILING);
  }, 60000);

  // 2 000 flat components walk about as many nodes, with the same headroom.
  it('mounts 2 000 flat components without blocking', async () => {
    const cost = await mountCost(scenarios.flat(2000));
    expect(cost.longestTask).toBe(0);
    expect(cost.duration).toBeLessThan(SETTLE_CEILING);
  }, 60000);

  /**
   * The failure this really guards against: a change that makes the scan
   * re-query the document per element turns mounting quadratic, and a
   * quadratic page only reveals itself at scale.
   *
   * This guard cannot use two equal sizes — differing sizes are the whole
   * question — so it keeps a bias the nesting guard below does not have.
   * Taking the best of several repeats favours the shorter side, because a
   * 14 ms run slips between interruptions that a 80 ms run absorbs, and
   * contention widens the gap: measured at 1.11 to 1.20 per component when
   * quiet, and up to 1.57 with all eight cores saturated. An earlier version
   * compared 500 against 4 000 and read 2.22 on a CI runner.
   *
   * So the threshold is placed between the noise and the signal rather than
   * just above the noise: five times the components read about 1.6 per
   * component at worst when linear, and would read 5 if quadratic. Three
   * sits between the two, with room on both sides.
   */
  it('costs the same per component at 5 000 as at 1 000', async () => {
    const ratio = await costRatio(scenarios.flat(1000), scenarios.flat(5000));
    expect(ratio / 5).toBeLessThan(3);
  }, 60000);

  /**
   * v4 claims nesting costs nothing, because no parent orchestrates its
   * children's mounting. Reintroducing that orchestration means a second
   * pass that finds and mounts children from each parent.
   *
   * Equal sizes on both sides — same component count, same node count, only
   * the shape differs — so this one has no short-side bias and can be tight.
   * Measured between 0.898 and 1.024 over ten runs, quiet and with every
   * core saturated. 5 000 rather than 2 000 so each side is long enough that
   * one scheduling gap is a small fraction of it; at 2 000, sequentially,
   * this read 1.91 on a CI runner.
   */
  it('mounts a four-deep tree for what a flat one costs', async () => {
    const ratio = await costRatio(scenarios.flat(5000), scenarios.nested(5000));
    expect(ratio).toBeLessThan(1.8);
  }, 60000);
});
