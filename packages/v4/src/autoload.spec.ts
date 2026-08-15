import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type BaseConfig, type BaseConstructor } from './Base.js';
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

/** A parent nobody imported the children of, declaring them by name. */
function defineParent(components: BaseConfig['components']) {
  counter += 1;
  const name = `Parent${counter}`;

  class Parent extends Base {
    static config: BaseConfig = { name, components };
  }

  return { name, Parent };
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

  it('drops its parameterized trigger when the element leaves, and re-establishes it on return', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible:200px' } });
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
  it('takes a parameterized entry default, standing in for the class config', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, {}, OFFSCREEN);
    registerManifest({ [name]: { load, mountStrategy: 'visible:200px 0px' } });
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

  it('hands a parameterized reversible override to the registry after the import', async () => {
    const { name, load, importCount } = defineLazy();
    const el = render(name, { 'data-mount': 'in-view:200px 0px' }, OFFSCREEN);
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

describe('a dynamic import declared in config.components', () => {
  it('mounts the child when its element appears, importing nothing before', async () => {
    const child = defineLazy();
    const { Parent } = defineParent({ [child.name]: child.load });

    registerComponent(Parent);
    await settle();

    // The parent registering is not a reason to download its family.
    expect(child.importCount()).toBe(0);

    const el = render(child.name);
    await settle();

    expect(child.importCount()).toBe(1);
    expect(instanceOf(el, child.name)?.$isMounted).toBe(true);
  });

  it('registers the class half of a mixed map right away', async () => {
    const lazy = defineLazy();
    counter += 1;
    const eagerName = `Sibling${counter}`;

    class Sibling extends Base {
      static config: BaseConfig = { name: eagerName };
    }

    const { Parent } = defineParent({ [eagerName]: Sibling, [lazy.name]: lazy.load });
    registerComponent(Parent);

    const siblingEl = render(eagerName);
    await settle();

    expect(instanceOf(siblingEl, eagerName)).toBeInstanceOf(Sibling);
    expect(lazy.importCount()).toBe(0);

    const lazyEl = render(lazy.name);
    await settle();

    expect(lazy.importCount()).toBe(1);
    expect(instanceOf(lazyEl, lazy.name)?.$isMounted).toBe(true);
  });

  it('imports the module once for every element declaring the child', async () => {
    const child = defineLazy();
    const { Parent } = defineParent({ [child.name]: child.load });

    registerComponent(Parent);
    const first = render(child.name);
    const second = render(child.name);
    await settle();

    expect(child.importCount()).toBe(1);
    expect(instanceOf(first, child.name)?.$isMounted).toBe(true);
    expect(instanceOf(second, child.name)?.$isMounted).toBe(true);
  });

  it('imports once when two parents declare the same child', async () => {
    const child = defineLazy();
    const first = defineParent({ [child.name]: child.load });
    const second = defineParent({ [child.name]: async () => child.Lazy });

    registerComponent(first.Parent);
    registerComponent(second.Parent);
    render(child.name);
    await settle();

    expect(child.importCount()).toBe(1);
  });

  it('lets a manifest declare the parent alone and the parent own its family', async () => {
    const child = defineLazy();
    const { name: parentName, Parent } = defineParent({ [child.name]: child.load });

    let parentImports = 0;
    registerManifest({
      [parentName]: async () => {
        parentImports += 1;
        return Parent;
      },
    });
    await settle();

    const root = document.createElement('div');
    root.setAttribute('data-component', parentName);
    root.setAttribute('style', ONSCREEN);
    const childEl = document.createElement('div');
    childEl.setAttribute('data-component', child.name);
    root.append(childEl);
    document.body.append(root);
    await settle();

    // Two chunks, in order: the parent's, then the one its own map names.
    expect(parentImports).toBe(1);
    expect(child.importCount()).toBe(1);
    expect(instanceOf(root, parentName)?.$isMounted).toBe(true);
    expect(instanceOf(childEl, child.name)?.$isMounted).toBe(true);
  });

  it('honours the element data-mount of a child nobody has imported', async () => {
    const child = defineLazy();
    const { Parent } = defineParent({ [child.name]: child.load });

    registerComponent(Parent);
    const el = render(child.name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();

    expect(child.importCount()).toBe(0);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(child.importCount()).toBe(1);
    expect(instanceOf(el, child.name)?.$isMounted).toBe(true);
  });

  it('reports a value which is neither a class nor an importer', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    counter += 1;
    const childName = `NotAThunk${counter}`;

    // A class not extending `Base` reads as callable but throws when called,
    // so it is caught here rather than on the element it would break.
    const { name: parentName, Parent } = defineParent({
      [childName]: class Detached {} as unknown as never,
    });
    registerComponent(Parent);
    render(childName);
    await settle();

    expect(error).toHaveBeenCalledWith(
      `[registry] "${parentName}" declares "${childName}" as neither a component class nor an importer, ignoring.`,
    );
    error.mockRestore();
  });
});

/** Every subclass declares a `static config` of its own, if only for `name`. */
function defineSubclass(Parent: BaseConstructor, components?: BaseConfig['components']) {
  counter += 1;
  const name = `Sub${counter}`;

  class Sub extends Parent {
    static config: BaseConfig = components ? { name, components } : { name };
  }

  return { name, Sub };
}

describe('the family a subclass inherits', () => {
  it('registers a class child its base declared', async () => {
    counter += 1;
    const childName = `Inherited${counter}`;

    class Child extends Base {
      static config: BaseConfig = { name: childName };
    }

    const { Parent } = defineParent({ [childName]: Child });
    const { Sub } = defineSubclass(Parent);

    // The base is never registered: the subclass alone carries the family.
    registerComponent(Sub);
    const el = render(childName);
    await settle();

    expect(instanceOf(el, childName)).toBeInstanceOf(Child);
  });

  it('registers a lazy child its base declared', async () => {
    const child = defineLazy();
    const { Parent } = defineParent({ [child.name]: child.load });
    const { Sub } = defineSubclass(Parent);

    registerComponent(Sub);
    const el = render(child.name);
    await settle();

    // A thunk has no other registration path, so the subclass loses the
    // child entirely when registration reads the own config.
    expect(child.importCount()).toBe(1);
    expect(instanceOf(el, child.name)?.$isMounted).toBe(true);
  });

  it('lets a subclass override one key without dropping the rest', async () => {
    const kept = defineLazy();
    const overridden = defineLazy();
    const stale = vi.fn();
    const { Parent } = defineParent({ [kept.name]: kept.load, [overridden.name]: stale });
    const { Sub } = defineSubclass(Parent, { [overridden.name]: overridden.Lazy });

    registerComponent(Sub);
    const keptEl = render(kept.name);
    const overriddenEl = render(overridden.name);
    await settle();

    expect(stale).not.toHaveBeenCalled();
    expect(instanceOf(overriddenEl, overridden.name)).toBeInstanceOf(overridden.Lazy);
    expect(kept.importCount()).toBe(1);
    expect(instanceOf(keptEl, kept.name)?.$isMounted).toBe(true);
  });

  it('registers a shared family once when the base registers too', async () => {
    const child = defineLazy();
    const { Parent } = defineParent({ [child.name]: child.load });
    const { Sub } = defineSubclass(Parent);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    registerComponent(Parent);
    registerComponent(Sub);
    const el = render(child.name);
    await settle();

    expect(warn).not.toHaveBeenCalled();
    expect(child.importCount()).toBe(1);
    expect(instanceOf(el, child.name)?.$isMounted).toBe(true);
    warn.mockRestore();
  });
});
