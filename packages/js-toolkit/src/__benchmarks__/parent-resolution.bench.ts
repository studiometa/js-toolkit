import { describe, bench } from 'vitest';
import { Base } from '@studiometa/js-toolkit';
import type { BaseConfig } from '@studiometa/js-toolkit';
import { findClosestInstance } from '#private/Base/utils.js';

/**
 * Benchmark for `__parent` resolution strategies.
 *
 * Current implementation (`Base/Base.ts` `__parent`) resolves the parent by
 * scanning the whole global instance set on every access — O(N_instances),
 * plus a full `Set` copy in `getInstances()`, plus an `$el.contains()` DOM walk
 * for every instance whose config declares `this.constructor` as a child.
 *
 * The prototype walks the DOM ancestors of `$el` and uses each element's
 * `__base__` map (the same O(1)-per-ancestor lookup `closestComponent` already
 * uses) — O(tree depth), independent of the total number of mounted instances.
 *
 * The noise instances are `Parent`s, whose config declares `Child` as a child
 * component. This is the worst case for the current algorithm: every noise
 * instance passes the `.includes(target.constructor)` guard and therefore pays
 * a full `$el.contains()` DOM walk, even though none of them is the real parent.
 *
 * Each scenario owns its own instance `Set` and its own detached DOM subtree, so
 * the scenarios coexist without clobbering shared state and N genuinely varies
 * at bench-run time (benches run after all `describe` bodies are collected).
 */

class Child extends Base {
  static config: BaseConfig = { name: 'Child' };
}

class Parent extends Base {
  static config: BaseConfig = { name: 'Parent', components: { Child } };
}

/** Replicates the current `Base.ts` `__parent` getter, over an explicit set. */
function resolveParentCurrent(target: Base, instances: Set<Base>): Base | null {
  const parents = new Set<Base>();

  // Mirror `getInstances()` copying the whole Set on every access.
  for (const instance of new Set(instances)) {
    if (!instance.$config.components) continue;
    if (
      Object.values(instance.$config.components).includes(target.constructor as never) &&
      instance.$el.contains(target.$el)
    ) {
      parents.add(instance);
    }
  }

  return findClosestInstance(target.$el, parents) ?? null;
}

/** Prototype: walk DOM ancestors, resolve via the per-element `__base__` map. */
function resolveParentDomWalk(target: Base): Base | null {
  let el: HTMLElement | null = target.$el.parentElement;

  while (el) {
    const baseMap = (el as Base['$el']).__base__;
    if (baseMap) {
      for (const instance of baseMap.values()) {
        if ((instance as unknown) === 'terminated') continue;
        const components = instance.$config.components;
        if (components && Object.values(components).includes(target.constructor as never)) {
          return instance;
        }
      }
    }
    el = el.parentElement;
  }

  return null;
}

/**
 * Build a self-contained scenario: a target Child nested `depth` levels under a
 * real Parent, plus `noise` unrelated Parent instances. Everything lives in its
 * own detached subtree and its own instance Set.
 */
function buildScenario(noise: number, depth: number): { child: Base; instances: Set<Base> } {
  const instances = new Set<Base>();
  const root = document.createElement('div');

  const parentEl = document.createElement('div');
  parentEl.dataset.component = 'Parent';
  root.appendChild(parentEl);
  instances.add(new Parent(parentEl));

  let host = parentEl;
  for (let i = 0; i < depth; i++) {
    const wrapper = document.createElement('div');
    host.appendChild(wrapper);
    host = wrapper;
  }
  const childEl = document.createElement('div');
  childEl.dataset.component = 'Child';
  host.appendChild(childEl);
  const child = new Child(childEl);
  instances.add(child);

  for (let i = 0; i < noise; i++) {
    const noiseEl = document.createElement('div');
    noiseEl.dataset.component = 'Parent';
    root.appendChild(noiseEl);
    instances.add(new Parent(noiseEl));
  }

  return { child, instances };
}

const DEPTH = 5;

for (const noise of [50, 500, 2000]) {
  describe(`__parent resolution — ${noise} instances, depth ${DEPTH}`, () => {
    const { child, instances } = buildScenario(noise, DEPTH);

    // Sanity: both strategies must agree on the resolved parent.
    if (resolveParentCurrent(child, instances) !== resolveParentDomWalk(child)) {
      throw new Error('Strategies disagree on the resolved parent');
    }

    bench('current (global scan)', () => {
      resolveParentCurrent(child, instances);
    });

    bench('prototype (DOM ancestor walk)', () => {
      resolveParentDomWalk(child);
    });
  });
}
