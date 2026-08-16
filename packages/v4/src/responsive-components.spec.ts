import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import { whenDOMSettled } from './dom-mutations.js';
import { getInstances } from './instances.js';
import { registerComponent, registerManifest } from './registry.js';
import { BREAKPOINTS, setBreakpoints } from './services/breakpoint.js';
import { resetDom, settle } from './test-utils.js';

let counter = 0;

interface TrackedComponent extends Base {
  mounts: number;
  destroys: number;
  terminations: number;
}

function defineTracked(prefix: string, config: Omit<BaseConfig, 'name'> = {}) {
  counter += 1;
  const name = `${prefix}${counter}`;

  class Tracked extends Base {
    static config: BaseConfig = { name, ...config };

    mounts = 0;
    destroys = 0;
    terminations = 0;

    mounted(): void {
      this.mounts += 1;
    }

    destroyed(): void {
      this.destroys += 1;
    }

    terminated(): void {
      this.terminations += 1;
    }
  }

  return { name, Tracked };
}

function register(...definitions: ReturnType<typeof defineTracked>[]): void {
  for (const { Tracked } of definitions) {
    registerComponent(Tracked);
  }
}

function render(attributes: Record<string, string>): HTMLElement {
  const el = document.createElement('div');
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  document.body.append(el);
  return el;
}

function instance(el: Element, name: string): TrackedComponent | undefined {
  return el.__base__?.get(name) as TrackedComponent | undefined;
}

function at(name: 'small' | 'middle' | 'wide'): void {
  const reached = { small: true, middle: name !== 'small', wide: name === 'wide' };
  setBreakpoints({
    small: reached.small ? '0rem' : '9999rem',
    middle: reached.middle ? '0rem' : '9999rem',
    wide: reached.wide ? '0rem' : '9999rem',
  });
}

async function mediaListenerRegistrations(during: () => Promise<void>): Promise<number> {
  const prototype = MediaQueryList.prototype;
  const original = prototype.addEventListener;
  let added = 0;
  prototype.addEventListener = function patched(
    this: MediaQueryList,
    ...args: Parameters<typeof original>
  ) {
    added += 1;
    return original.apply(this, args);
  };
  try {
    await during();
  } finally {
    prototype.addEventListener = original;
  }
  return added;
}

afterEach(async () => {
  await resetDom();
  setBreakpoints(BREAKPOINTS);
  await whenDOMSettled();
});

describe('responsive component declarations', () => {
  it('unions base and scoped token sets, supports several tokens, and deduplicates names', async () => {
    at('small');
    const action = defineTracked('Action');
    const analytics = defineTracked('Analytics');
    const mobileMenu = defineTracked('MobileMenu');
    const mobileSearch = defineTracked('MobileSearch');
    register(action, analytics, mobileMenu, mobileSearch);

    const el = render({
      'data-component': `${action.name} ${analytics.name} ${action.name}`,
      'data-component:small': `${mobileMenu.name} ${mobileSearch.name} ${action.name}`,
    });
    await whenDOMSettled();

    expect([...(el.__base__?.keys() ?? [])].sort()).toEqual(
      [action.name, analytics.name, mobileMenu.name, mobileSearch.name].sort(),
    );
    expect(instance(el, action.name)?.mounts).toBe(1);
    expect(getInstances(mobileMenu.name)).toEqual([instance(el, mobileMenu.name)]);
  });

  it('replaces lower scoped sets, stops them on an empty override, and restores fresh identities', async () => {
    at('small');
    const base = defineTracked('BaseFeature');
    const mobile = defineTracked('Mobile');
    const tablet = defineTracked('Tablet');
    register(base, mobile, tablet);

    const el = render({
      'data-component': base.name,
      'data-component:small': mobile.name,
      'data-component:middle': tablet.name,
      'data-component:wide': '',
    });
    await whenDOMSettled();
    const firstMobile = instance(el, mobile.name);
    expect(firstMobile?.$isMounted).toBe(true);

    at('middle');
    await whenDOMSettled();
    const firstTablet = instance(el, tablet.name);
    expect(firstMobile?.$isTerminated).toBe(true);
    expect(firstTablet?.$isMounted).toBe(true);
    expect(instance(el, mobile.name)).toBeUndefined();
    expect(instance(el, base.name)?.$isMounted).toBe(true);

    at('wide');
    await whenDOMSettled();
    expect(firstTablet?.$isTerminated).toBe(true);
    expect(instance(el, tablet.name)).toBeUndefined();
    expect(instance(el, base.name)?.$isMounted).toBe(true);

    at('small');
    await whenDOMSettled();
    expect(instance(el, mobile.name)).not.toBe(firstMobile);
    expect(instance(el, mobile.name)?.$isMounted).toBe(true);
  });

  it('preserves shared instances while terminating old-only names in both crossing directions', async () => {
    at('small');
    const shared = defineTracked('Shared');
    const mobile = defineTracked('Narrow');
    const desktop = defineTracked('Desktop');
    register(shared, mobile, desktop);

    const el = render({
      'data-component:small': `${shared.name} ${mobile.name}`,
      'data-component:wide': `${shared.name} ${desktop.name}`,
    });
    await whenDOMSettled();
    const sharedInstance = instance(el, shared.name);
    const firstMobile = instance(el, mobile.name);

    at('wide');
    await whenDOMSettled();
    const firstDesktop = instance(el, desktop.name);
    expect(instance(el, shared.name)).toBe(sharedInstance);
    expect(sharedInstance?.mounts).toBe(1);
    expect(firstMobile?.$isTerminated).toBe(true);
    expect(firstDesktop?.$isMounted).toBe(true);

    at('small');
    await whenDOMSettled();
    expect(instance(el, shared.name)).toBe(sharedInstance);
    expect(firstDesktop?.$isTerminated).toBe(true);
    expect(instance(el, mobile.name)).not.toBe(firstMobile);
  });

  it('reconciles inactive and active scoped writes, removals, and same-batch changes', async () => {
    at('small');
    const first = defineTracked('First');
    const second = defineTracked('Second');
    const third = defineTracked('Third');
    register(first, second, third);

    const el = render({
      'data-component:small': first.name,
      'data-component:wide': second.name,
    });
    await whenDOMSettled();
    const firstInstance = instance(el, first.name);

    el.setAttribute('data-component:wide', third.name);
    await whenDOMSettled();
    expect(instance(el, first.name)).toBe(firstInstance);
    expect(instance(el, second.name)).toBeUndefined();
    expect(instance(el, third.name)).toBeUndefined();

    el.setAttribute('data-component:small', second.name);
    await whenDOMSettled();
    expect(firstInstance?.$isTerminated).toBe(true);
    expect(instance(el, second.name)?.$isMounted).toBe(true);

    el.removeAttribute('data-component:small');
    await whenDOMSettled();
    expect(instance(el, second.name)).toBeUndefined();

    el.setAttribute('data-component:small', first.name);
    el.setAttribute('data-component:small', third.name);
    await whenDOMSettled();
    expect(instance(el, first.name)).toBeUndefined();
    expect(instance(el, third.name)?.$isMounted).toBe(true);
  });

  it('reconciles live base writes and removals without disturbing the active scoped set', async () => {
    at('small');
    const base = defineTracked('BaseLive');
    const nextBase = defineTracked('NextBase');
    const scoped = defineTracked('ScopedLive');
    register(base, nextBase, scoped);

    const el = render({
      'data-component': base.name,
      'data-component:small': scoped.name,
    });
    await whenDOMSettled();
    const scopedInstance = instance(el, scoped.name);

    el.setAttribute('data-component', nextBase.name);
    await whenDOMSettled();
    expect(instance(el, base.name)).toBeUndefined();
    expect(instance(el, nextBase.name)?.$isMounted).toBe(true);
    expect(instance(el, scoped.name)).toBe(scopedInstance);

    el.removeAttribute('data-component');
    await whenDOMSettled();
    expect(instance(el, nextBase.name)).toBeUndefined();
    expect(instance(el, scoped.name)).toBe(scopedInstance);
  });

  it('keeps responsive instances across removal, reinsertion, and DOM moves', async () => {
    at('small');
    const feature = defineTracked('Movable');
    register(feature);
    const firstParent = document.createElement('section');
    const secondParent = document.createElement('section');
    document.body.append(firstParent, secondParent);
    const el = document.createElement('div');
    el.setAttribute('data-component:small', feature.name);
    firstParent.append(el);
    await whenDOMSettled();
    const retained = instance(el, feature.name);

    el.remove();
    await whenDOMSettled();
    expect(retained?.$isMounted).toBe(false);
    expect(retained?.$isTerminated).toBe(false);

    firstParent.append(el);
    await whenDOMSettled();
    expect(instance(el, feature.name)).toBe(retained);
    expect(retained?.mounts).toBe(2);

    secondParent.append(el);
    await whenDOMSettled();
    expect(instance(el, feature.name)).toBe(retained);
    expect(retained?.mounts).toBe(3);
    expect(retained?.destroys).toBe(2);
  });

  it('does not import a lazy declaration before activation and still applies data-mount', async () => {
    at('small');
    const lazy = defineTracked('LazyResponsive');
    let imports = 0;
    registerManifest({
      [lazy.name]: {
        load: async () => {
          imports += 1;
          return lazy.Tracked;
        },
        mountStrategy: 'interaction',
      },
    });
    const el = render({ 'data-component:wide': lazy.name });
    await whenDOMSettled();
    expect(imports).toBe(0);

    at('wide');
    await whenDOMSettled();
    expect(imports).toBe(0);
    expect(instance(el, lazy.name)).toBeUndefined();

    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(imports).toBe(1);
    expect(instance(el, lazy.name)?.$isMounted).toBe(true);
  });

  it('includes eager lazy work caused by a crossing in DOM settlement', async () => {
    at('small');
    const lazy = defineTracked('SettledLazy');
    let imports = 0;
    registerManifest({
      [lazy.name]: async () => {
        imports += 1;
        return lazy.Tracked;
      },
    });
    const el = render({ 'data-component:wide': lazy.name });
    await whenDOMSettled();
    expect(imports).toBe(0);

    at('wide');
    await whenDOMSettled();
    expect(imports).toBe(1);
    expect(instance(el, lazy.name)?.$isMounted).toBe(true);
  });

  it('uses class mountStrategy and lets an element data-mount override it', async () => {
    at('small');
    const feature = defineTracked('Strategy', { mountStrategy: 'interaction' });
    register(feature);
    const waiting = render({ 'data-component:wide': feature.name });
    const eager = render({
      'data-component:wide': feature.name,
      'data-mount': 'eager',
    });
    await whenDOMSettled();

    at('wide');
    await whenDOMSettled();
    expect(instance(waiting, feature.name)).toBeUndefined();
    expect(instance(eager, feature.name)?.$isMounted).toBe(true);

    waiting.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await whenDOMSettled();
    expect(instance(waiting, feature.name)?.$isMounted).toBe(true);
  });

  it('discovers declarations from a custom setBreakpoints replacement and settles their mount', async () => {
    const feature = defineTracked('CustomBreakpoint');
    register(feature);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = render({ 'data-component:desktop': feature.name });
    await whenDOMSettled();
    expect(instance(el, feature.name)).toBeUndefined();

    setBreakpoints({ mobile: '0rem', desktop: '0rem' });
    await whenDOMSettled();
    const mounted = instance(el, feature.name);
    expect(mounted?.$isMounted).toBe(true);

    el.removeAttribute('data-component:desktop');
    await whenDOMSettled();
    expect(mounted?.$isTerminated).toBe(true);
    warn.mockRestore();
  });

  it('ignores and warns once for a suffix naming no configured breakpoint', async () => {
    const base = defineTracked('WarningBase');
    const invalid = defineTracked('Invalid');
    register(base, invalid);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = render({
      'data-component': base.name,
      'data-component:xxs:xs:s': invalid.name,
    });
    await whenDOMSettled();

    expect(instance(el, base.name)?.$isMounted).toBe(true);
    expect(instance(el, invalid.name)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`data-component:xxs:xs:s` names no breakpoint'),
    );

    el.setAttribute('data-component', `${base.name} ${base.name}`);
    await whenDOMSettled();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('opens no breakpoint listener for pages with plain declarations only', async () => {
    const feature = defineTracked('PlainOnly');
    register(feature);

    const added = await mediaListenerRegistrations(async () => {
      render({ 'data-component': feature.name });
      await whenDOMSettled();
    });

    expect(added).toBe(0);
  });
});
