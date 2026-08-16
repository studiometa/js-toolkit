/**
 * v3 and v4 alive in one document.
 *
 * Both versions used to key their per-element instance map with the same
 * string, `el.__base__`, so each read the other's entries as its own: v4's
 * teardown called `$destroy()` on v3 instances, and on the `'terminated'`
 * string v3 leaves behind, while v3's child resolution accepted a v4 instance
 * as one of its own children. v4 now keys its map with `INSTANCES`, and these
 * specs are the proof.
 *
 * Spelling `INSTANCES` back as `'__base__'` in `protocol-symbols.ts` — which
 * is the pre-rename state — fails all four:
 *
 * - the terminated-instance spec records
 *   `TypeError: instance.$destroy is not a function`, thrown by
 *   `destroyWithin` on the `'terminated'` string;
 * - the reconcile spec finds v4 terminated the v3 instance instead of its own;
 * - the shared-name specs find one instance where two belong, the last writer
 *   having overwritten the other.
 *
 * Note that constructing any v3 component registers it — `Base`'s constructor
 * calls `addToRegistry` — so v3's document observer is live here too, and both
 * registries really do share the document. v3's globals are cleared after each
 * spec so one spec's registration cannot mount components in the next.
 *
 * This is the one v4 file that imports v3, so it is the one file `tsconfig.json`
 * excludes: v3's sources answer to the repository's `strict: false` project and
 * report ~150 errors under v4's strict one. `tsconfig.coexistence.json` checks
 * it there instead, and `lint:types` runs both.
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
  Base as BaseV3,
  type BaseConfig as BaseConfigV3,
  type BaseEl,
} from '../../js-toolkit/src/index.js';
import { Base } from './Base.js';
import { INSTANCES } from './protocol-symbols.js';
import { registerComponent } from './registry.js';
import { resetDom, settle } from './test-utils.js';

class V3Widget extends BaseV3 {
  static config: BaseConfigV3 = { name: 'Widget' };
}

let v4Destroys = 0;

class V4Widget extends Base {
  static config = { name: 'V4Widget' };

  destroyed() {
    v4Destroys += 1;
  }
}

/** A v4 component answering to the name a v3 component also answers to. */
class V4Widget2 extends Base {
  static config = { name: 'Widget2' };
}

registerComponent(V4Widget);
registerComponent(V4Widget2);

class V3Widget2 extends BaseV3 {
  static config: BaseConfigV3 = { name: 'Widget2' };
}

/** A v3 parent whose declared `Widget2` child shares its name with a v4 one. */
class V3Host extends BaseV3 {
  static config: BaseConfigV3 = { name: 'Host', components: { Widget2: V3Widget2 } };
}

function render(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

function v3Instances(el: Element): Map<string, unknown> | undefined {
  return (el as BaseEl).__base__;
}

afterEach(() => {
  v4Destroys = 0;
  resetDom();
  // v3's registry is a plain map on `globalThis`; emptying it leaves its
  // observer attached with nothing to mount, which is as absent as v3 gets.
  globalThis.__JS_TOOLKIT_REGISTRY__?.clear();
  globalThis.__JS_TOOLKIT_INSTANCES__?.clear();
  globalThis.__JS_TOOLKIT_ELEMENTS__?.clear();
});

describe('v3 and v4 sharing a document', () => {
  it('walks a subtree holding a terminated v3 instance', async () => {
    const root = render(
      '<div data-component="V4Widget"><span data-component="Widget"></span></div>',
    );
    const v3El = root.querySelector('[data-component="Widget"]') as HTMLElement;
    await settle();

    const widget = await new V3Widget(v3El).$mount();
    // The value that used to break v4: v3 replaces the instance with a string.
    await widget.$terminate();
    expect(v3Instances(v3El)?.get('Widget')).toBe('terminated');

    // The teardown runs on the scheduler, so a throw lands on `window` rather
    // than in this frame.
    const errors: string[] = [];
    const record = (event: ErrorEvent) => errors.push(event.message);
    window.addEventListener('error', record);

    // v4's registry tears the whole subtree down, `v3El` included.
    root.remove();
    await settle();
    window.removeEventListener('error', record);

    expect(errors).toEqual([]);
    expect(v4Destroys).toBe(1);
    // v3's marker survives untouched — v4 never looked at that map.
    expect(v3Instances(v3El)?.get('Widget')).toBe('terminated');
  });

  it('terminates its own instance, not the v3 one under the same name', async () => {
    const root = render('<div data-component="Widget2"></div>');
    const el = root.firstElementChild as HTMLElement;
    await settle();

    const v4Widget = el[INSTANCES]?.get('Widget2') as V4Widget2;
    // v3 mounts second: on a shared map it would have overwritten v4's entry.
    const v3Widget = await new V3Widget2(el).$mount();
    expect(v4Widget.$isMounted).toBe(true);

    // Dropping the declaration makes v4 terminate what its map holds for that
    // name, on an element that stays connected. v3 has no reason to react.
    el.removeAttribute('data-component');
    await settle();

    expect(v4Widget.$isMounted).toBe(false);
    expect(v3Widget.$isMounted).toBe(true);
    expect(v3Instances(el)?.get('Widget2')).toBe(v3Widget);
  });

  it('gives each version its own instance under a shared component name', async () => {
    const root = render('<div data-component="Widget2"></div>');
    const el = root.firstElementChild as HTMLElement;
    await settle();

    const v3Widget = await new V3Widget2(el).$mount();
    const v4Widget = el[INSTANCES]?.get('Widget2');

    expect(v4Widget).toBeInstanceOf(V4Widget2);
    expect(v3Widget).toBeInstanceOf(V3Widget2);
    expect([...(el[INSTANCES]?.keys() ?? [])]).toEqual(['Widget2']);
    expect([...(v3Instances(el)?.keys() ?? [])]).toEqual(['Widget2']);
    expect(el[INSTANCES]?.get('Widget2')).not.toBe(v3Widget);
  });

  it('never resolves a v4 instance as a v3 child', async () => {
    const root = render('<div data-component="Host"><span data-component="Widget2"></span></div>');
    const hostEl = root.firstElementChild as HTMLElement;
    const childEl = hostEl.firstElementChild as HTMLElement;
    await settle();
    expect(childEl[INSTANCES]?.get('Widget2')).toBeInstanceOf(V4Widget2);

    const host = await new V3Host(hostEl).$mount();
    const [child] = host.$children.Widget2 as V3Widget2[];

    expect(child).toBeInstanceOf(V3Widget2);
    expect(child).not.toBe(childEl[INSTANCES]?.get('Widget2'));
  });
});
