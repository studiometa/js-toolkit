import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Base, registerComponents, type BaseConfig } from '../../src/index.js';
import { resetDom, settle } from '../../src/test-utils.js';
import { InView } from './InView.js';
import { InViewOnce } from './InViewOnce.js';

/**
 * Specs for the `InView` port.
 *
 * ## How these differ from ui's
 *
 * ui's specs mock the whole `IntersectionObserver` — `mockIsIntersecting(el,
 * true)`, `intersectionMockInstance(el)` — because they run in jsdom, where
 * there is no viewport to cross. These run in a real Chromium against a real
 * observer, so an element is parked below the fold or brought back into it,
 * exactly as `src/mount-strategies.spec.ts` does for the strategy itself.
 *
 * That is not a cosmetic change for this family. Two of ui's five `InView`
 * assertions are about the *mock*: `intersectionMockInstance(el).rootMargin`
 * and `expect(observer.disconnect).toHaveBeenCalled()`. Neither has a v4
 * counterpart, because the observer belongs to the registry's mount strategy
 * and is not reachable from anywhere. They are replaced below by assertions on
 * what the observer is *for*: whether a crossing mounts, and whether a later
 * crossing still does.
 *
 * ## Deliberately not ported
 *
 * - `should have the correct config` (both classes): `config.emits` no longer
 *   exists, and `$emits` is types-only — asserting it at runtime would assert
 *   nothing. The emissions themselves are asserted throughout.
 * - `expect(terminateSpy).toHaveBeenCalledTimes(1)` for `InViewOnce`: v4 does
 *   not terminate, and `does not destroy when it leaves the viewport` below is
 *   the assertion that replaced it — a stronger one, since terminating was
 *   only ever v3's way of achieving it.
 */

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

/**
 * Just below the fold — outside the viewport, but well inside a 400px
 * `rootMargin` if one could be set.
 */
const BELOW_THE_FOLD = 'position:absolute;top:calc(100vh + 50px);left:0;width:50px;height:50px';

/**
 * A subclass of `InView` that declares a config of its own without restating
 * the mount strategy — the shape every ui subclass has, since `name` is
 * mandatory.
 */
class InViewSubclass extends InView {
  static config: BaseConfig = { name: 'InViewSubclass' };
}

registerComponents(InView, InViewOnce, InViewSubclass);

afterEach(resetDom);

/** Give the observer a few frames to deliver. */
async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

function render(name: string, style: string, attributes: Record<string, string> = {}) {
  const el = document.createElement('div');
  el.setAttribute('data-component', name);
  el.setAttribute('style', style);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  document.body.append(el);
  return el;
}

/**
 * Record every `in-view` / `out-of-view` on the document, where they bubble
 * to. Listening on the element is not an option here: the component may not
 * exist yet when the listener has to be in place, and the first `in-view` is
 * emitted from the mount the listener is waiting for.
 */
function record(): { events: string[]; stop: () => void } {
  const events: string[] = [];
  const listener = (event: Event) => events.push(event.type);
  document.addEventListener('in-view', listener);
  document.addEventListener('out-of-view', listener);
  return {
    events,
    stop() {
      document.removeEventListener('in-view', listener);
      document.removeEventListener('out-of-view', listener);
    },
  };
}

let log: ReturnType<typeof record>;

beforeEach(() => {
  log = record();
});

afterEach(() => {
  log.stop();
});

describe('InView', () => {
  it('emits `in-view` when the element enters the viewport', async () => {
    const el = render('InView', OFFSCREEN);
    await observed();
    expect(log.events).toEqual([]);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('emits `out-of-view` when the element leaves the viewport', async () => {
    const el = render('InView', ONSCREEN);
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view', 'out-of-view']);
  });

  it('re-emits `in-view` on each re-entry, from the same instance', async () => {
    const el = render('InView', ONSCREEN);
    await observed();
    const instance = el.__base__?.get('InView');

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view', 'out-of-view', 'in-view']);
    // v3 rebuilt nothing either, but it had to keep an `__isVisible` latch to
    // avoid mounting twice per batch; v4's `$mount()` is idempotent.
    expect(el.__base__?.get('InView')).toBe(instance);
  });

  it('does not instantiate the component until it is first seen', async () => {
    const el = render('InView', OFFSCREEN);
    await observed();

    // Stronger than v3, where the decorator constructed the instance eagerly
    // in order to give it an observer. Here nothing exists to observe *with*
    // until the strategy says so, so an off-screen `InView` costs one entry in
    // the registry's observer and no instance at all.
    expect(el.__base__?.get('InView')).toBeUndefined();
  });
});

describe('InViewOnce', () => {
  it('emits `in-view` when the element enters the viewport', async () => {
    const el = render('InViewOnce', OFFSCREEN);
    await observed();

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('never emits `out-of-view`, and does not re-emit on a later entry', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('stays mounted after leaving the viewport, where v3 terminated', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();
    const instance = el.__base__?.get('InViewOnce');

    el.setAttribute('style', OFFSCREEN);
    await observed();

    // v3 called `$terminate()` from `mounted()` to stop the decorator's
    // observer repeating. v4's `visible` strategy disconnects its own observer
    // on the first crossing, so the instance can simply live on — which is
    // what makes the port four lines with no lifecycle call in it.
    expect(instance?.$isMounted).toBe(true);
    expect(instance?.$isTerminated).toBe(false);
  });

  it('still emits `out-of-view` never, when the element is removed from the DOM', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();

    el.remove();
    await observed();

    // The `destroyed()` override is what earns its keep here: removing the
    // element destroys the instance, and the inherited hook would announce a
    // leave for a component whose whole contract is one event.
    expect(log.events).toEqual(['in-view']);
  });
});

describe('what the mount strategy cannot express', () => {
  /**
   * **RED ON PURPOSE — documents REPORT.md gap 23.**
   *
   * v3's `withMountWhenInView` takes an `IntersectionObserverInit`, both as a
   * decorator argument (defaulting to `{ threshold: [0, 1] }`) and as the
   * documented `data-option-intersection-observer` attribute — which ui's own
   * `should expose the configurable intersectionObserver option` spec covers.
   * `applyMountStrategy()` builds `new IntersectionObserver(callback)` with no
   * init at all, and builds it in the registry, so a component cannot reach
   * it. There is no component-side workaround: observing the element again
   * would not change the observation the mount was already decided by.
   *
   * This will flip to green the moment a strategy can carry an init — the
   * `media:<query>` strategy already proves a parameterised strategy name is
   * expressible.
   */
  it.fails('honours a rootMargin so an element below the fold mounts early', async () => {
    const el = render('InView', BELOW_THE_FOLD, {
      'data-option-intersection-observer': '{"rootMargin": "400px"}',
    });
    await observed();

    expect(log.events).toEqual(['in-view']);
    expect(el.__base__?.get('InView')?.$isMounted).toBe(true);
  });

  /**
   * REPORT.md gap 24, now closed.
   *
   * `resolveStrategy()` used to read `ComponentClass.config.mountStrategy` off
   * the class's own static, not off the config `resolveConfig()` merges along
   * the prototype chain. `refs`, `options` and `components` all merge — that
   * is what issue #627 fixed — so a subclass that declares a `static config`
   * at all (and every subclass must, for `name`) silently fell back to
   * `eager`: it still worked, it just mounted everywhere, which for an
   * `InView` means firing `in-view` for an element nobody has seen.
   */
  it('inherits the mount strategy in a subclass that declares its own config', async () => {
    const el = render('InViewSubclass', OFFSCREEN);
    await observed();

    expect(el.__base__?.get('InViewSubclass')).toBeUndefined();
  });
});

describe('the strategy is per element, which the decorator never was', () => {
  class Eager extends Base {
    static config: BaseConfig = { name: 'InViewEagerProbe' };
    mounts = 0;
    mounted(): void {
      this.mounts += 1;
    }
  }
  registerComponents(Eager);

  it('lets `data-mount` override the class default on one element', async () => {
    const el = render('InView', OFFSCREEN, { 'data-mount': 'eager' });
    await observed();

    // v3's decorator is baked into the class: an `InView` that should mount
    // eagerly on one page needs a second class. Here it is one attribute.
    expect(el.__base__?.get('InView')?.$isMounted).toBe(true);
    expect(log.events).toEqual(['in-view']);
  });

  it('lets `data-mount="in-view"` give the strategy to a component that never asked', async () => {
    const el = render('InViewEagerProbe', OFFSCREEN, { 'data-mount': 'in-view' });
    await observed();
    expect(el.__base__?.get('InViewEagerProbe')).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect((el.__base__?.get('InViewEagerProbe') as Eager | undefined)?.mounts).toBe(1);
  });
});
