import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import { registerComponent } from './registry.js';
import { resetDom, settle } from './test-utils.js';

/**
 * Strategies observe the real viewport, so a probe is either parked far
 * below the fold or brought back into it.
 */
const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

let counter = 0;

/**
 * Register a component with a unique name, tracking its mount cycles.
 */
function defineTracked(config: Omit<BaseConfig, 'name'> = {}) {
  counter += 1;
  const name = `Strategy${counter}`;

  class Tracked extends Base {
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

  registerComponent(Tracked);
  return { name, Tracked };
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

describe('eager (default)', () => {
  it('mounts as soon as the element is in the DOM', async () => {
    const { name } = defineTracked();
    const el = render(name);
    await settle();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('data-mount="visible"', () => {
  it('leaves the component uninstantiated until it is seen', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();

    // Not merely unmounted: no instance exists yet, so the component is
    // invisible to queries and announces nothing.
    expect(el.__base__?.get(name)).toBeUndefined();
  });

  it('mounts once it intersects and stays mounted afterwards', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();

    el.setAttribute('style', ONSCREEN);
    await observed();
    const instance = instanceOf(el, name);
    expect(instance?.$isMounted).toBe(true);

    // One-shot: leaving the viewport does not unmount it.
    el.setAttribute('style', OFFSCREEN);
    await observed();
    expect(instance?.$isMounted).toBe(true);
  });
});

describe('data-mount="in-view"', () => {
  it('mounts and unmounts the same instance as it crosses the viewport', async () => {
    const { name, Tracked } = defineTracked();
    type Tracked = InstanceType<typeof Tracked>;
    const el = render(name, { 'data-mount': 'in-view' }, ONSCREEN);
    await observed();

    const instance = instanceOf<Tracked>(el, name);
    expect(instance?.$isMounted).toBe(true);
    expect(instance?.mounts).toBe(1);

    el.setAttribute('style', OFFSCREEN);
    await observed();
    expect(instance?.$isMounted).toBe(false);
    expect(instance?.destroys).toBe(1);

    el.setAttribute('style', ONSCREEN);
    await observed();
    // Same instance, second cycle.
    expect(instanceOf(el, name)).toBe(instance);
    expect(instance?.$isMounted).toBe(true);
    expect(instance?.mounts).toBe(2);
  });
});

describe('data-mount="interaction"', () => {
  it('waits for the user to aim at the element', async () => {
    const { name } = defineTracked();
    // Parked away from the pointer on purpose: `pointerenter` counts as
    // intent, and it fires the moment an element appears under a resting
    // cursor — which the top-left corner of the viewport often is.
    const el = render(name, { 'data-mount': 'interaction' }, OFFSCREEN);
    await settle();
    expect(el.__base__?.get(name)).toBeUndefined();

    // `pointerdown` precedes `click`, so the component is ready in time.
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('data-mount="idle"', () => {
  it('mounts when the main thread goes idle', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'idle' });
    await observed();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('data-mount="media:…"', () => {
  it('mounts only while the query matches', async () => {
    const matching = defineTracked();
    const failing = defineTracked();
    render(matching.name, { 'data-mount': 'media:(min-width: 1px)' });
    const narrow = render(failing.name, { 'data-mount': 'media:(max-width: 1px)' });
    await observed();

    expect(
      instanceOf(document.querySelector(`[data-component="${matching.name}"]`)!, matching.name)
        ?.$isMounted,
    ).toBe(true);
    expect(narrow.__base__?.get(failing.name)).toBeUndefined();
  });
});

describe('config.mountStrategy', () => {
  it('sets the default for every instance of a component', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible' });
    const el = render(name, {}, OFFSCREEN);
    await observed();
    expect(el.__base__?.get(name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is overridden by the element attribute', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible' });
    // Parked offscreen, but asked to mount eagerly anyway.
    const el = render(name, { 'data-mount': 'eager' }, OFFSCREEN);
    await settle();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is restored when the element override is removed', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible' });
    const el = render(name, { 'data-mount': 'interaction' }, OFFSCREEN);
    await settle();
    expect(el.__base__?.get(name)).toBeUndefined();

    el.removeAttribute('data-mount');
    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('dynamic data-mount', () => {
  it('replaces a waiting strategy when the attribute changes', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();
    expect(el.__base__?.get(name)).toBeUndefined();

    el.setAttribute('data-mount', 'eager');
    await settle();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('teardown', () => {
  it('stops watching an element that leaves the document', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();

    el.remove();
    await observed();
    // The strategy was disposed with the element: bringing it back into
    // view off-document must not mount anything.
    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(el.__base__?.get(name)).toBeUndefined();
  });

  it('re-schedules an element moved in a single batch', async () => {
    const { name, Tracked } = defineTracked();
    type Tracked = InstanceType<typeof Tracked>;
    const from = document.createElement('div');
    const to = document.createElement('div');
    document.body.append(from, to);
    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    from.append(el);
    await observed();
    const instance = instanceOf<Tracked>(el, name);
    expect(instance?.$isMounted).toBe(true);
    expect(instance?.mounts).toBe(1);

    // A move is one removal record plus one addition record. It ends one
    // mount cycle and starts another without replacing the instance.
    to.append(el);
    await observed();
    expect(instanceOf(el, name)).toBe(instance);
    expect(instance?.$isMounted).toBe(true);
    expect(instance?.destroys).toBe(1);
    expect(instance?.mounts).toBe(2);
    expect(el.parentElement).toBe(to);
  });

  it('re-schedules an element that comes back', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);

    el.remove();
    await observed();
    document.body.append(el);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('several components on one element', () => {
  it('applies the element strategy to each of them', async () => {
    const first = defineTracked();
    const second = defineTracked();

    const el = document.createElement('div');
    el.setAttribute('data-component', `${first.name} ${second.name}`);
    el.setAttribute('data-mount', 'visible');
    el.setAttribute('style', OFFSCREEN);
    document.body.append(el);
    await observed();

    expect(el.__base__?.get(first.name)).toBeUndefined();
    expect(el.__base__?.get(second.name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, first.name)?.$isMounted).toBe(true);
    expect(instanceOf(el, second.name)?.$isMounted).toBe(true);
  });
});
