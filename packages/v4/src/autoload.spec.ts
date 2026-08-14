import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import { whenDOMSettled } from './dom-mutations.js';
import { getInstances } from './instances.js';
import { registerComponent, registerManifest } from './registry.js';
import { resetDom, settle } from './test-utils.js';

/** Strategies observe the real viewport, so a probe is parked or shown. */
const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

let counter = 0;

/**
 * A component class nobody has imported yet, plus the importer which will.
 * The importer resolves on a microtask, like a real dynamic import.
 */
function defineLazy(config: Omit<BaseConfig, 'name'> = {}) {
  counter += 1;
  const name = `Lazy${counter}`;

  class Lazy extends Base {
    static config: BaseConfig = { name, ...config };

    mounts = 0;
    destroys = 0;

    mounted(): void {
      this.mounts += 1;
    }

    destroyed(): void {
      this.destroys += 1;
    }
  }

  let imports = 0;
  const load = async () => {
    imports += 1;
    return Lazy;
  };

  return { name, Lazy, load, importCount: () => imports };
}

function render(name: string, attributes: Record<string, string> = {}, style = ONSCREEN) {
  const el = document.createElement('div');
  el.setAttribute('data-component', name);
  el.setAttribute('style', style);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  document.body.append(el);
  return el;
}

function instanceOf<T extends Base>(el: Element, name: string): T | undefined {
  return el.__base__?.get(name) as T | undefined;
}

/** Give observers a few frames to deliver their callbacks. */
async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

afterEach(resetDom);

describe('registerManifest', () => {
  it('imports and mounts a component declared before the manifest', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name);
    await settle();

    expect(el.__base__).toBeUndefined();

    registerManifest({ [name]: load });
    await settle();

    expect(importCount()).toBe(1);
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('imports and mounts a component inserted after the manifest', async () => {
    const { name, load } = defineLazy();
    registerManifest({ [name]: load });
    await settle();

    const el = render(name);
    await settle();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('imports the module once for every element declaring the token', async () => {
    const { name, load, importCount } = defineLazy();
    const first = render(name);
    const second = render(name);
    registerManifest({ [name]: load });
    await settle();

    expect(importCount()).toBe(1);
    expect(instanceOf(first, name)?.$isMounted).toBe(true);
    expect(instanceOf(second, name)?.$isMounted).toBe(true);
  });

  it('imports nothing when no element declares the token', async () => {
    const { name, load, importCount } = defineLazy();
    registerManifest({ [name]: load });
    await settle();

    expect(importCount()).toBe(0);
  });

  it('resolves the class from a module namespace, by name or by default', async () => {
    const named = defineLazy();
    const fallback = defineLazy();
    const namedEl = render(named.name);
    const defaultEl = render(fallback.name);

    registerManifest({
      [named.name]: async () => ({ [named.name]: named.Lazy, other: 1 }),
      [fallback.name]: async () => ({ default: fallback.Lazy }),
    });
    await settle();

    expect(instanceOf(namedEl, named.name)?.$isMounted).toBe(true);
    expect(instanceOf(defaultEl, fallback.name)?.$isMounted).toBe(true);
  });
});

describe('a lazy declaration before its class arrives', () => {
  it('has no instance, so page-wide and component-scoped lookups miss it', async () => {
    const { name, load } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await observed();

    expect(el.__base__).toBeUndefined();
    expect(getInstances(name)).toEqual([]);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(getInstances(name)).toHaveLength(1);
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is dropped when its token is removed before the trigger fires', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await observed();

    el.removeAttribute('data-component');
    await settle();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(importCount()).toBe(0);
  });

  it('drops its trigger when the element leaves, and re-establishes it on return', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await observed();

    el.remove();
    // Visible is meaningless while detached, and the trigger is gone anyway.
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(importCount()).toBe(0);

    document.body.append(el);
    await observed();

    expect(importCount()).toBe(1);
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('the strategy that triggers the import', () => {
  it('takes the entry default, standing in for the class config', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await observed();

    expect(importCount()).toBe(0);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(importCount()).toBe(1);
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('lets the element data-mount win over the entry default', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, { 'data-mount': 'interaction' }, ONSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await observed();

    expect(importCount()).toBe(0);

    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();

    expect(importCount()).toBe(1);
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('hands a reversible strategy over to the registry after the import', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, { 'data-mount': 'in-view' }, OFFSCREEN);
    registerManifest({ [name]: load });
    await observed();

    expect(importCount()).toBe(0);

    el.setAttribute('style', ONSCREEN);
    await observed();

    const instance = instanceOf(el, name);
    expect(importCount()).toBe(1);
    expect(instance?.$isMounted).toBe(true);

    el.setAttribute('style', OFFSCREEN);
    await observed();

    expect(instance?.$isMounted).toBe(false);
    // A second crossing remounts without a second import.
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(importCount()).toBe(1);
    expect(instance?.$isMounted).toBe(true);
  });
});

describe('whenDOMSettled and a lazy component', () => {
  it('waits for an eager import, its registration and its mount', async () => {
    const { name, load } = defineLazy();
    registerManifest({ [name]: load });
    await settle();

    const el = render(name);
    await whenDOMSettled();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('does not wait for a conditional trigger', async () => {
    const { name, load, importCount } = defineLazy();
    registerManifest({ [name]: { load, mountStrategy: 'visible' } });
    await settle();

    render(name, {}, OFFSCREEN);
    await whenDOMSettled();

    expect(importCount()).toBe(0);
  });
});

describe('registerManifest collisions and failures', () => {
  it('ignores a token an eager class already owns', async () => {
    counter += 1;
    const name = `Owned${counter}`;

    class Owned extends Base {
      static config: BaseConfig = { name };
    }

    registerComponent(Owned);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const load = vi.fn();
    registerManifest({ [name]: load });
    const el = render(name);
    await settle();

    expect(load).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(`[registry] "${name}" is already registered, ignoring.`);
    expect(instanceOf(el, name)).toBeInstanceOf(Owned);
    warn.mockRestore();
  });

  it('ignores a token an earlier manifest already owns', async () => {
    const { name, load, importCount } = defineLazy();
    const later = vi.fn();
    registerManifest({ [name]: load });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerManifest({ [name]: later });
    render(name);
    await settle();

    expect(importCount()).toBe(1);
    expect(later).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('reports an import failure once and leaves the page running', async () => {
    counter += 1;
    const name = `Broken${counter}`;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const load = vi.fn(async () => {
      throw new Error('chunk 404');
    });

    registerManifest({ [name]: load });
    const first = render(name);
    const second = render(name);
    await settle();

    expect(load).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledOnce();
    expect(first.__base__).toBeUndefined();
    expect(second.__base__).toBeUndefined();
    error.mockRestore();
  });

  it('reports a module which resolves to no component class', async () => {
    counter += 1;
    const name = `Empty${counter}`;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    registerManifest({ [name]: async () => ({ notAClass: 42 }) });
    render(name);
    await settle();

    expect(error).toHaveBeenCalledOnce();
    error.mockRestore();
  });

  it('warns when the resolved class does not answer to the declared token', async () => {
    const { name, Lazy } = defineLazy();
    counter += 1;
    const token = `Alias${counter}`;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerManifest({ [token]: async () => Lazy });
    const el = render(token);
    await settle();

    expect(warn).toHaveBeenCalledWith(
      `[registry] "${token}" resolved to a component named "${name}".`,
    );
    expect(el.__base__).toBeUndefined();
    warn.mockRestore();
  });
});
