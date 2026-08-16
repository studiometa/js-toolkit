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
 * Every threshold is a ceiling on the *best* of several repeats. A CI runner
 * is slower and noisier than this machine, and a guard that flakes gets
 * deleted by the next person, which is worse than no guard.
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

/** Repeats per measurement, so one scheduling hiccup cannot fail the build. */
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

/** The cheapest of `REPEATS` runs, after one unmeasured run warms the paths. */
async function bestMountCost(html: string): Promise<MountCost> {
  await mountOnce(html);
  const runs: MountCost[] = [];
  for (let index = 0; index < REPEATS; index += 1) {
    runs.push(await mountOnce(html));
  }
  return {
    duration: Math.min(...runs.map((run) => run.duration)),
    longestTask: Math.min(...runs.map((run) => run.longestTask)),
  };
}

describe('mounting at page scale', () => {
  // 500 realistic components is a heavy real page. Its un-chunked pass costs
  // ~7 ms here, so reaching 50 ms needs a machine seven times slower.
  it('mounts 500 realistic components without blocking', async () => {
    const cost = await bestMountCost(scenarios.realistic(500));
    expect(cost.longestTask).toBe(0);
    expect(cost.duration).toBeLessThan(SETTLE_CEILING);
  }, 60000);

  // 2 000 flat components walk about as many nodes, with the same headroom.
  it('mounts 2 000 flat components without blocking', async () => {
    const cost = await bestMountCost(scenarios.flat(2000));
    expect(cost.longestTask).toBe(0);
    expect(cost.duration).toBeLessThan(SETTLE_CEILING);
  }, 60000);

  /**
   * The failure this really guards against: a change that makes the scan
   * re-query the document per element turns mounting quadratic, and a
   * quadratic page only reveals itself at scale. A ratio of per-component
   * costs does not care how fast the runner is, so it can be tighter than
   * any wall-clock ceiling — five times the components must not cost more
   * than 2.5× per component, where quadratic would cost five.
   *
   * Both sides are deliberately in the tens of milliseconds. An earlier
   * version compared 500 against 4 000 and read 2.22 on a CI runner while
   * reading 1.0 here, because taking the best of several repeats favours the
   * shorter side: a 3 ms run dodges an interruption that a 70 ms run
   * absorbs. Comparable magnitudes remove that bias. Measured at 1.07 here
   * and 0.78 on `ubuntu-latest`, where per-component cost falls with size.
   */
  it('costs the same per component at 5 000 as at 1 000', async () => {
    const small = await bestMountCost(scenarios.flat(1000));
    const large = await bestMountCost(scenarios.flat(5000));
    expect(large.duration / 5000 / (small.duration / 1000)).toBeLessThan(2.5);
  }, 60000);

  /**
   * v4 claims nesting costs nothing, because no parent orchestrates its
   * children's mounting. Reintroducing that orchestration means a second
   * pass that finds and mounts children from each parent, so it would at
   * least double the nested side. Measured between 0.82 and 1.15 across
   * quiet and fully contended runs here, and below 1.0 on `ubuntu-latest`,
   * where a four-deep tree mounts slightly faster than a flat one.
   */
  it('mounts a four-deep tree for what a flat one costs', async () => {
    const flat = await bestMountCost(scenarios.flat(2000));
    const nested = await bestMountCost(scenarios.nested(2000));
    expect(nested.duration / flat.duration).toBeLessThan(1.8);
  }, 60000);
});
