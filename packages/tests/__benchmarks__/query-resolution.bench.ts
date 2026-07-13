import { describe, bench } from 'vitest';
import { Base } from '@studiometa/js-toolkit';
import type { BaseConfig } from '@studiometa/js-toolkit';

/**
 * Benchmark for `queryComponent` / `queryComponentAll` resolution strategies
 * when scoped to an element root (`{ from }`).
 *
 * The old implementation scanned the whole global instance set on every call —
 * O(N_instances) — copying the `Set` (as `getInstances()` does) and running an
 * `$el.contains()` DOM walk for every instance to enforce containment, even for
 * instances that live entirely outside the `from` subtree.
 *
 * The new implementation resolves matches via a scoped `querySelectorAll('*')`
 * descendant traversal plus a check of `from` itself, reading each element's
 * `__base__` map (the same O(1)-per-element lookup `closestComponent` uses). It
 * scales with the size of the `from` subtree, independent of how many unrelated
 * instances are mounted elsewhere.
 *
 * The noise instances share the target's config name and are mounted OUTSIDE the
 * `from` subtree — the worst case for the old algorithm: every noise instance
 * matches by name and therefore pays a full `$el.contains()` DOM walk, yet the
 * new strategy never visits them because they are not descendants of `from`.
 *
 * Each scenario owns its own instance `Set` and its own detached DOM subtree, so
 * the scenarios coexist without clobbering shared global state and N genuinely
 * varies at bench-run time (benches run after all `describe` bodies are
 * collected).
 */

class Query extends Base {
  static config: BaseConfig = { name: 'Query' };
}

const NAME = 'Query';

/** Replicates the old global-scan strategy, over an explicit instance set. */
function queryAllCurrent(from: HTMLElement, instances: Set<Base>): Base[] {
  const selected = new Set<Base>();

  // Mirror `getInstances()` copying the whole Set on every access.
  for (const instance of new Set(instances)) {
    if (instance.$config.name !== NAME) continue;
    if (from === instance.$el || from.contains(instance.$el)) {
      selected.add(instance);
    }
  }

  return Array.from(selected);
}

/** New strategy: scoped `querySelectorAll('*')` + self + per-element `__base__`. */
function queryAllDomScan(from: HTMLElement, live: Set<Base>): Base[] {
  const selected = new Set<Base>();

  const resolve = (el: Base['$el']) => {
    const baseMap = el.__base__;
    if (!baseMap) return;
    const instance = baseMap.get(NAME);
    // Skip terminated entries and instances no longer live (the `hasInstance`
    // gate the real helper applies against the global storage).
    if (!instance || (instance as unknown) === 'terminated' || !live.has(instance as Base)) return;
    selected.add(instance as Base);
  };

  resolve(from as Base['$el']);
  for (const el of from.querySelectorAll<HTMLElement>('*')) {
    resolve(el as Base['$el']);
  }

  return Array.from(selected);
}

/**
 * Build a self-contained scenario: a `from` container holding `MATCHES` target
 * instances nested `depth` levels deep, plus `noise` unrelated instances of the
 * same name mounted OUTSIDE `from`. Everything lives in its own detached subtree
 * and its own instance Set. Constructing a `Query` populates the element's
 * `__base__` map, so no mount is required.
 */
function buildScenario(
  noise: number,
  depth: number,
  matches: number,
): { from: HTMLElement; instances: Set<Base> } {
  const instances = new Set<Base>();
  const root = document.createElement('div');

  const from = document.createElement('div');
  root.appendChild(from);

  let host = from;
  for (let i = 0; i < depth; i++) {
    const wrapper = document.createElement('div');
    host.appendChild(wrapper);
    host = wrapper;
  }
  for (let i = 0; i < matches; i++) {
    const el = document.createElement('div');
    host.appendChild(el);
    instances.add(new Query(el));
  }

  // Noise: same-name instances OUTSIDE `from` (siblings under root).
  for (let i = 0; i < noise; i++) {
    const el = document.createElement('div');
    root.appendChild(el);
    instances.add(new Query(el));
  }

  return { from, instances };
}

const DEPTH = 5;
const MATCHES = 5;

function sameResult(a: Base[], b: Base[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((instance) => setB.has(instance));
}

for (const noise of [50, 500, 2000]) {
  describe(`query resolution — ${noise} instances, depth ${DEPTH}`, () => {
    const { from, instances } = buildScenario(noise, DEPTH, MATCHES);

    // Sanity: both strategies must resolve the same set of instances.
    if (!sameResult(queryAllCurrent(from, instances), queryAllDomScan(from, instances))) {
      throw new Error('Strategies disagree on the resolved instances');
    }

    bench('current (global scan)', () => {
      queryAllCurrent(from, instances);
    });

    bench('prototype (scoped DOM scan)', () => {
      queryAllDomScan(from, instances);
    });
  });
}
