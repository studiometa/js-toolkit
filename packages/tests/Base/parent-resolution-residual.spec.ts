import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Base, BaseConfig, withBreakpointObserver } from '@studiometa/js-toolkit';
import { h, mount, useMatchMedia, resizeWindow, mockFeatures } from '#test-utils';

/**
 * Residual `$parent === null in mounted()` characterization.
 *
 * Since 3.4.2 (#699) `$parent` is a *live* getter (no longer assigned by the
 * parent's `ChildrenManager`); since 3.6.0 (#730) it resolves by walking the DOM
 * ancestors via each element's `__base__` map. It is deprecated in 3.6.0 in favor
 * of `$closest(name)` and will be removed in v4. On every access the internal
 * `__parent` getter accepts an ancestor only if ALL of the following hold (see
 * `Base/Base.ts` `__parent`, lines ~188-213):
 *   1. the ancestor's `__base__` map holds an instance that is NOT `'terminated'`;
 *   2. `hasInstance(instance)` is true — i.e. the instance is currently in the
 *      global instance storage. Membership is added on the `before-mounted` hook
 *      (`addInstance`, `Base.ts` ~431-433) and removed on `after-destroyed`
 *      (`deleteInstance`, ~434-436);
 *   3. the ancestor's merged `$config.components` includes `this.constructor`.
 *
 * `$closest(name)` (`Base.ts` `$closest` -> `helpers/queryComponent.ts`
 * `closestComponent`, lines ~157-186) resolves against the SAME `__base__` map but
 * applies only `instance !== 'terminated'` + `instanceIsMatching` (name / CSS /
 * optional `:mounted`/`:destroyed` token). It never calls `hasInstance` and never
 * consults `config.components`. This asymmetry is the crux of every scenario
 * below: `$parent` can be null while `$closest(name)` still returns the very same
 * (possibly unmounted / destroyed / config-mismatched) ancestor object.
 *
 * The 3.4.3 / #702 fix (moving `addInstance` to `before-mounted`) only closes the
 * window when the parent is *genuinely mounted* (its `before-mounted` fired)
 * before the child's `mounted()` runs. The scenarios here are the residual paths
 * where that precondition does not hold, or where gate #3 fails independently.
 * Scenario C (async-declared children) is FIXED in #732; A, B and D remain
 * expected behaviour (a suppressed/destroyed parent, a config identity mismatch,
 * and an unconstructed parent, respectively).
 *
 * NOT reproduced deterministically (documented, intentionally omitted):
 *   - The plain independent-auto-mount case (a child mounted alone with its
 *     parent absent from the registry) is a simpler variant of scenario D and is
 *     not repeated here.
 *   - The MutationObserver batch with the parent's constructor REGISTERED
 *     (parent-first, child-first, `$update` injection, observer-only injection):
 *     #702 fully closes this window in both blocking modes — `$parent` and
 *     `$closest` always resolve — so there is nothing residual to pin. The only
 *     residual observer path (parent element present but its ctor never
 *     registered) IS pinned in scenario D below.
 */

const flush = async (ticks = 12) => {
  for (let i = 0; i < ticks; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};

beforeEach(() => {
  document.body.innerHTML = '';
  globalThis['__JS_TOOLKIT_REGISTRY__'] = new Map();
  globalThis['__JS_TOOLKIT_INSTANCES__'] = new Set();
  globalThis['__JS_TOOLKIT_ELEMENTS__'] = new Set();
});

/**
 * SCENARIO A — Breakpoint-gated parent (`withBreakpointObserver`).
 *
 * Root cause: `withBreakpointObserver` drives both edges of the `hasInstance`
 * gate WITHOUT ever touching the `__base__` map.
 *   - At an inactive breakpoint its overridden `$mount`
 *     (`decorators/withBreakpointObserver.ts` ~185-197) returns WITHOUT calling
 *     `super.$mount()`, so `before-mounted` never fires and `addInstance` is
 *     never called -> `hasInstance(parent)` is false even though `parentEl
 *     .__base__` holds the instance (written in the ctor, `Base.ts` ~424-425).
 *   - On a resize to an inactive breakpoint, the resize callback (~76-85) calls
 *     `parent.$destroy()`, whose `after-destroyed` hook runs `deleteInstance`, so
 *     the instance drops out of storage while `__base__` retains it ($destroy
 *     never writes `'terminated'`; only `$terminate` does, `Base.ts` ~549).
 *
 * Verdict: EXPECTED. A breakpoint-suppressed parent is, by construction, absent
 * from the global instance storage during the child's `mounted()`; #702 cannot
 * help because `before-mounted` never fired. `$closest` disagrees because it does
 * not apply the `hasInstance` gate.
 *
 * `768px <-> (min-width: 48rem)` is breakpoint `s` (inactive); `1280px <->
 * (min-width: 80rem)` is breakpoint `l` (active). This file keeps that mapping
 * consistent so the resize service's width-keyed breakpoint cache stays coherent.
 */
describe('Scenario A — breakpoint-gated parent', () => {
  class BpChild extends Base {
    static config: BaseConfig = { name: 'BpChild' };

    parentDuringMounted: Base | null | undefined;

    closestDuringMounted: Base | undefined;

    mounted() {
      this.parentDuringMounted = this.$parent;
      this.closestDuringMounted = this.$closest('BpParent');
    }
  }
  class BpParent extends withBreakpointObserver(Base) {
    static config: BaseConfig = { name: 'BpParent', components: { BpChild } };
  }

  it('A1: parent never mounts at an inactive breakpoint -> $parent null, $closest returns the UNMOUNTED parent', async () => {
    // Establish an inactive breakpoint (`s`) before constructing the parent so
    // its decorated `$mount` short-circuits and `before-mounted` never fires.
    useMatchMedia('(min-width: 48rem)');
    await resizeWindow({ width: 768 });

    const childEl = h('div', { dataComponent: 'BpChild' });
    const parentEl = h('div', { dataComponent: 'BpParent', dataOptionActiveBreakpoints: 'l' }, [
      childEl,
    ]);
    document.body.append(parentEl);

    const parent = new BpParent(parentEl);
    await parent.$mount();
    // Decorated $mount returned without calling super.$mount().
    expect(parent.$isMounted).toBe(false);

    const child = new BpChild(childEl);
    await mount(child);

    // $parent: null — parent is absent from the global instance storage
    // (hasInstance false), so the `__parent` gate rejects it.
    expect(child.parentDuringMounted).toBeNull();
    expect(child.$parent).toBeNull();

    // $closest: resolves the UNMOUNTED parent — present in `__base__`, not
    // 'terminated', and `closestComponent` never checks `hasInstance`.
    expect(child.closestDuringMounted).toBe(parent);
    expect(child.closestDuringMounted!.$isMounted).toBe(false);
  });

  it('A2/A3: mounted parent resolves, then a breakpoint $destroy flips $parent to null while $closest keeps the destroyed parent, and a return to `l` re-resolves it', async () => {
    // Mount the parent at an active breakpoint (`l`).
    useMatchMedia('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });

    const childEl = h('div', { dataComponent: 'BpChild' });
    const parentEl = h('div', { dataComponent: 'BpParent', dataOptionActiveBreakpoints: 'l' }, [
      childEl,
    ]);
    document.body.append(parentEl);

    const parent = new BpParent(parentEl);
    await parent.$mount();
    expect(parent.$isMounted).toBe(true);

    const child = new BpChild(childEl);
    await mount(child);

    // Parent mounted + registered before the child's mounted() -> #702 window is
    // closed here: $parent resolves.
    expect(child.parentDuringMounted).toBe(parent);
    expect(child.$parent).toBe(parent);

    // A2: resize to an inactive breakpoint -> decorator calls parent.$destroy().
    useMatchMedia('(min-width: 48rem)');
    await resizeWindow({ width: 768 });
    await flush();
    expect(parent.$isMounted).toBe(false);

    // $parent: null — deleteInstance dropped the parent from storage.
    expect(child.$parent).toBeNull();
    // $closest: still the SAME (now destroyed) parent — $destroy never clears
    // `__base__` nor writes 'terminated'.
    const destroyedClosest = child.$closest('BpParent');
    expect(destroyedClosest).toBe(parent);
    expect(destroyedClosest!.$isMounted).toBe(false);

    // A3: resize back to `l` -> decorator re-mounts (setTimeout(…, 0), covered by
    // resizeWindow's 400ms advance) -> $parent resolves again.
    useMatchMedia('(min-width: 80rem)');
    await resizeWindow({ width: 1280 });
    await flush();
    expect(parent.$isMounted).toBe(true);
    expect(child.$parent).toBe(parent);
  });
});

/**
 * SCENARIO B — Registry / subclass name-collision mismatch.
 *
 * A library ships a base `Parent` (config.name 'Parent', NO components). A
 * consumer subclasses it (`App extends Parent`, SAME config.name 'Parent',
 * declaring `components: { Child }`) — the documented @studiometa/ui pattern. If
 * the BASE is what gets constructed on the element, the ancestor sitting on the
 * parent element is a base `Parent` whose merged `$config.components` is `{}`.
 *
 * Root cause: the `__parent` gate #3 runs `Object.values(instance.$config
 * .components).includes(this.constructor)`. `this.constructor` is `Child`; the
 * base `Parent`'s components is `{}`, so it never matches — `$parent` is null even
 * though the parent is live, mounted, and a DOM ancestor. This is orthogonal to
 * #702 (registration timing is fine here); the failure is a class-identity
 * mismatch in gate #3.
 *
 * Compounding registry bug: `Base/utils.ts` `addToRegistry` (~203-208)
 * early-returns `if (registry().has(nameOrSelector))` BEFORE registering the
 * ctor's declared children. So once 'Parent' maps to the base, a later
 * `App.$register()` is a silent no-op: 'Parent' stays the base and App's 'Child'
 * is never registered.
 *
 * Verdict: EXPECTED (a config/identity mismatch, not a mount-ordering bug).
 */
describe('Scenario B — subclass name-collision mismatch', () => {
  it('base parent (no components) mounted on the element -> $parent null, $closest resolves', async () => {
    let parentDuringMounted: Base | null | undefined;
    let closestDuringMounted: Base | undefined;

    class Child extends Base {
      static config: BaseConfig = { name: 'Child' };

      mounted() {
        parentDuringMounted = this.$parent;
        closestDuringMounted = this.$closest('Parent');
      }
    }
    // Library base: same name, NO declared components.
    class Parent extends Base {
      static config: BaseConfig = { name: 'Parent' };
    }

    const childEl = h('div', { dataComponent: 'Child' });
    const parentEl = h('div', { dataComponent: 'Parent' }, [childEl]);
    document.body.append(parentEl);

    // The BASE is what gets constructed on the element.
    const parent = new Parent(parentEl);
    await mount(parent);
    const child = new Child(childEl);
    await mount(child);

    // $parent: null — base Parent.$config.components is {} so gate #3 fails.
    expect(parentDuringMounted).toBeNull();
    expect(child.$parent).toBeNull();
    // $closest: resolves — closestComponent ignores config.components.
    expect(closestDuringMounted).toBe(parent);
    expect(child.$closest('Parent')).toBe(parent);
  });

  it('contrast: constructing the subclass that declares the child resolves $parent', async () => {
    let parentDuringMounted: Base | null | undefined;

    class Child extends Base {
      static config: BaseConfig = { name: 'Child' };

      mounted() {
        parentDuringMounted = this.$parent;
      }
    }
    // Subclass declares Child, and is what gets constructed on the element.
    class App extends Base {
      static config: BaseConfig = { name: 'Parent', components: { Child } };
    }

    const childEl = h('div', { dataComponent: 'Child' });
    const parentEl = h('div', { dataComponent: 'Parent' }, [childEl]);
    document.body.append(parentEl);

    const app = new App(parentEl);
    await mount(app);
    const child = new Child(childEl);
    await mount(child);

    expect(parentDuringMounted).toBe(app);
  });

  it('registry compounding: registering the base first shuts out the subclass and its declared children', async () => {
    class Child extends Base {
      static config: BaseConfig = { name: 'Child' };
    }
    class Parent extends Base {
      static config: BaseConfig = { name: 'Parent' };
    }
    class App extends Parent {
      static config: BaseConfig = { name: 'Parent', components: { Child } };
    }

    // No matching elements in the DOM, so $register mounts nothing here.
    Parent.$register();
    App.$register();

    const registry = globalThis['__JS_TOOLKIT_REGISTRY__'] as Map<string, unknown>;
    // 'Parent' stays mapped to the BASE — App's addToRegistry early-returned.
    expect(registry.get('Parent')).toBe(Parent);
    // App's declared 'Child' was never reached, so it is never registered.
    expect(registry.has('Child')).toBe(false);
  });
});

/**
 * SCENARIO C — Async / lazy declared child (FIXED in #732).
 *
 * A parent declares a child as a loader function
 * (`components: { AsyncChild: () => Promise.resolve(AsyncChild) }`). The parent
 * mounts parent-driven; the async child resolves and mounts a few ticks later.
 *
 * Before #732, `__parent` tested `Object.values(instance.$config.components)
 * .includes(this.constructor)`. For an async child, `config.components` maps the
 * name to the LOADER FUNCTION, never the resolved class, so the identity check was
 * ALWAYS false and `$parent` was null permanently — a regression vs the pre-#699
 * `ChildrenManager` assignment, and inconsistent with a sync sibling.
 *
 * #732 fixes it: when a `components` value is a loader function, `__parent`
 * resolves it through the ancestor's own `ChildrenManager.__asyncComponentPromises`
 * WeakMap (keyed by that loader) and matches its resolved `ctor`. A parent-mounted
 * async child now resolves `$parent` like a sync sibling — this is a read of the
 * ancestor's already-populated cache, with no shared-config mutation (which would
 * have defeated `addToRegistry`'s lazy-registration skip). `$closest` resolved by
 * name already and is unchanged.
 *
 * Note the mount timing: `registerAll` runs before `mountAll`, so the loader's
 * WeakMap entry is `resolved` before the async child is constructed — hence
 * `$parent` resolves during the child's own `mounted()`, not only afterwards.
 */
describe('Scenario C — async/lazy declared child', () => {
  it('async-declared child: $parent resolves via the resolved-ctor lookup, like a sync sibling', async () => {
    let asyncParentDuringMounted: unknown = 'UNSET';
    let asyncClosestDuringMounted: unknown = 'UNSET';
    let asyncRan = false;
    let syncParentDuringMounted: Base | null | undefined;

    class AsyncChild extends Base {
      static config: BaseConfig = { name: 'AsyncChild' };

      mounted() {
        asyncRan = true;
        asyncParentDuringMounted = this.$parent;
        asyncClosestDuringMounted = this.$closest('AsyncParent');
      }
    }
    class SyncChild extends Base {
      static config: BaseConfig = { name: 'SyncChild' };

      mounted() {
        syncParentDuringMounted = this.$parent;
      }
    }
    class AsyncParent extends Base {
      static config: BaseConfig = {
        name: 'AsyncParent',
        components: {
          // Loader function — resolved class is never a value of components.
          AsyncChild: () => Promise.resolve(AsyncChild),
          SyncChild,
        },
      };
    }

    const asyncChildEl = h('div', { dataComponent: 'AsyncChild' });
    const syncChildEl = h('div', { dataComponent: 'SyncChild' });
    const parentEl = h('div', { dataComponent: 'AsyncParent' }, [asyncChildEl, syncChildEl]);
    document.body.append(parentEl);

    const parent = new AsyncParent(parentEl);
    await mount(parent);
    // The async child mount is fire-and-forget; wait for its mounted() to run.
    for (let i = 0; i < 100 && !asyncRan; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    expect(asyncRan).toBe(true);
    expect(parent.$isMounted).toBe(true);

    // Control: the SYNC sibling (value === constructor) resolves its parent.
    expect(syncParentDuringMounted).toBe(parent);

    // Async child: $parent resolves during its own mounted() — the loader is
    // looked up via the ancestor's __asyncComponentPromises WeakMap.
    expect(asyncParentDuringMounted).toBe(parent);
    // $closest resolves by name too.
    expect(asyncClosestDuringMounted).toBe(parent);

    // Still resolved after everything settled.
    const asyncChild = (asyncChildEl as { __base__?: Map<string, Base> }).__base__!.get(
      'AsyncChild',
    ) as Base;
    expect(asyncChild.$isMounted).toBe(true);
    expect(asyncChild.$parent).toBe(parent);
    expect(asyncChild.$closest('AsyncParent')).toBe(parent);
  });

  it('async child via a `{ default }` loader form resolves $parent', async () => {
    let parentDuringMounted: unknown = 'UNSET';
    let ran = false;

    class AsyncChild extends Base {
      static config: BaseConfig = { name: 'AsyncChild' };

      mounted() {
        ran = true;
        parentDuringMounted = this.$parent;
      }
    }
    class AsyncParent extends Base {
      static config: BaseConfig = {
        name: 'AsyncParent',
        // Module-style loader — exercises `module.default ?? module`.
        components: { AsyncChild: () => Promise.resolve({ default: AsyncChild }) },
      };
    }

    const childEl = h('div', { dataComponent: 'AsyncChild' });
    const parentEl = h('div', { dataComponent: 'AsyncParent' }, [childEl]);
    document.body.append(parentEl);

    const parent = new AsyncParent(parentEl);
    await mount(parent);
    for (let i = 0; i < 100 && !ran; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    expect(ran).toBe(true);
    expect(parentDuringMounted).toBe(parent);
  });

  it('two parents each resolve their own async child (per-manager WeakMap, no cross-talk)', async () => {
    const seen: Array<{ child: Base; parent: Base | null | undefined }> = [];

    class AsyncChild extends Base {
      static config: BaseConfig = { name: 'AsyncChild' };

      mounted() {
        seen.push({ child: this, parent: this.$parent });
      }
    }
    class AsyncParent extends Base {
      static config: BaseConfig = {
        name: 'AsyncParent',
        components: { AsyncChild: () => Promise.resolve(AsyncChild) },
      };
    }

    const mkParent = () => {
      const childEl = h('div', { dataComponent: 'AsyncChild' });
      const parentEl = h('div', { dataComponent: 'AsyncParent' }, [childEl]);
      document.body.append(parentEl);
      return new AsyncParent(parentEl);
    };

    const a = mkParent();
    const b = mkParent();
    await mount(a, b);
    for (let i = 0; i < 100 && seen.length < 2; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    expect(seen.length).toBe(2);
    // Each async child resolved to its OWN parent — no cross-talk between the two
    // per-manager WeakMaps.
    for (const { child, parent } of seen) {
      expect(parent).toBe(child.$closest('AsyncParent'));
      expect([a, b]).toContain(parent);
    }
    expect(seen[0].parent).not.toBe(seen[1].parent);
  });
});

/**
 * SCENARIO D — Observer-driven mount with the parent's constructor UNREGISTERED.
 *
 * Uses the REAL document-wide MutationObserver installed by `$register()` /
 * `addToRegistry` (`Base/utils.ts` `mutationCallback`).
 *
 * When the parent's constructor IS registered, #702 fully closes the window: the
 * whole batch is constructed and `addInstance`d (on `before-mounted`, before the
 * first `await` in `$mount`) before ANY `mounted()` runs, so both `$parent` and
 * `$closest` resolve regardless of registry order or blocking — that RESOLVED
 * case is asserted as the contrast below and is intentionally not treated as a
 * residual bug.
 *
 * The residual: when the parent element is present in the DOM but its constructor
 * was never registered, the observer auto-mounts only the (registered) child. The
 * ancestor is never constructed, so nothing is ever written to `parentEl
 * .__base__`. `$parent` is null (no live ancestor) AND `$closest` is undefined (no
 * `__base__` entry at all) — the one case where the two resolvers agree.
 *
 * Verdict: EXPECTED. This is the realistic post-upgrade failure when a child
 * component is imported/registered independently of a parent that is unregistered
 * or registered under a different name.
 */
describe('Scenario D — observer-driven mount, parent ctor unregistered', () => {
  let restoreFeatures: (() => void) | undefined;
  afterEach(() => {
    restoreFeatures?.();
    restoreFeatures = undefined;
  });

  for (const blocking of [true, false]) {
    it(`residual (blocking=${blocking}): only the child ctor is registered -> $parent null AND $closest undefined`, async () => {
      restoreFeatures = mockFeatures({ blocking }).unmock;

      let parentDuringMounted: Base | null | undefined = 'UNSET' as unknown as Base;
      let closestDuringMounted: Base | undefined = 'UNSET' as unknown as Base;

      class SliderChild extends Base {
        static config: BaseConfig = { name: 'SliderChild' };

        mounted() {
          parentDuringMounted = this.$parent;
          closestDuringMounted = this.$closest('Slider');
        }
      }
      // Declared by Slider, but Slider itself is never registered.
      class Slider extends Base {
        static config: BaseConfig = { name: 'Slider', components: { SliderChild } };
      }
      void Slider;

      // Register ONLY the child constructor.
      SliderChild.$register();

      const childEl = h('div', { dataComponent: 'SliderChild' });
      const sliderEl = h('div', { dataComponent: 'Slider' }, [childEl]);
      document.body.append(sliderEl); // one mutation batch
      await flush(); // observer -> mutationCallback auto-mounts the orphan child

      const child = (childEl as { __base__?: Map<string, Base> }).__base__?.get('SliderChild');
      expect(child?.$isMounted).toBe(true);

      // Parent ctor never ran, so parentEl.__base__ has no 'Slider' entry.
      expect(parentDuringMounted).toBeNull();
      expect(closestDuringMounted).toBeUndefined();
    });

    it(`contrast (blocking=${blocking}): registering the parent closes the window -> both resolve`, async () => {
      restoreFeatures = mockFeatures({ blocking }).unmock;

      let parentDuringMounted: Base | null | undefined = 'UNSET' as unknown as Base;
      let closestDuringMounted: Base | undefined;

      class SliderChild extends Base {
        static config: BaseConfig = { name: 'SliderChild' };

        mounted() {
          parentDuringMounted = this.$parent;
          closestDuringMounted = this.$closest('Slider');
        }
      }
      class Slider extends Base {
        static config: BaseConfig = { name: 'Slider', components: { SliderChild } };
      }

      // Registering the parent recursively registers SliderChild too.
      Slider.$register();

      const childEl = h('div', { dataComponent: 'SliderChild' });
      const sliderEl = h('div', { dataComponent: 'Slider' }, [childEl]);
      document.body.append(sliderEl);
      await flush();

      const slider = (sliderEl as { __base__?: Map<string, Base> }).__base__?.get('Slider');
      expect(slider?.$isMounted).toBe(true);
      // #702 window closed: both resolve during the child's mounted().
      expect(parentDuringMounted).toBe(slider);
      expect(closestDuringMounted).toBe(slider);
    });
  }
});
