import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import { INSTANCES } from './protocol-symbols.js';
import { registerComponent } from './registry.js';
import { resetDom, settle } from './test-utils.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

let counter = 0;

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
  return el[INSTANCES]?.get(name) as T | undefined;
}

async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

afterEach(async () => {
  vi.restoreAllMocks();
  await resetDom();
});

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

    expect(el[INSTANCES]?.get(name)).toBeUndefined();
  });

  it('mounts once with a root margin and stays mounted afterwards', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible:200px' }, OFFSCREEN);
    await observed();

    el.setAttribute('style', ONSCREEN);
    await observed();
    const instance = instanceOf(el, name);
    expect(instance?.$isMounted).toBe(true);

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
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

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
    expect(narrow[INSTANCES]?.get(failing.name)).toBeUndefined();
  });
});

describe('config.mountStrategy', () => {
  it('sets a parameterized default for every instance of a component', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible:200px 0px' });
    const el = render(name, {}, OFFSCREEN);
    await observed();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is overridden by the element attribute', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible' });
    const el = render(name, { 'data-mount': 'eager' }, OFFSCREEN);
    await settle();

    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('lets a parameterized data-mount override the component config', async () => {
    const { name } = defineTracked({ mountStrategy: 'eager' });
    const el = render(name, { 'data-mount': 'in-view:200px 0px' }, OFFSCREEN);
    await observed();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    const instance = instanceOf(el, name);
    expect(instance?.$isMounted).toBe(true);

    el.setAttribute('style', OFFSCREEN);
    await observed();
    expect(instance?.$isMounted).toBe(false);
  });

  it('is restored when the element override is removed', async () => {
    const { name } = defineTracked({ mountStrategy: 'visible' });
    const el = render(name, { 'data-mount': 'interaction' }, OFFSCREEN);
    await settle();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

    el.removeAttribute('data-mount');
    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is inherited by a subclass that declares a config of its own', async () => {
    const { Tracked } = defineTracked({ mountStrategy: 'visible' });
    counter += 1;
    const name = `StrategyHeir${counter}`;

    class Heir extends Tracked {
      static config: BaseConfig = { name };
    }
    registerComponent(Heir);

    const el = render(name, {}, OFFSCREEN);
    await observed();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });

  it('is overridden by a subclass declaring its own strategy', async () => {
    const { Tracked } = defineTracked({ mountStrategy: 'visible' });
    counter += 1;
    const name = `StrategyHeir${counter}`;

    class Heir extends Tracked {
      static config: BaseConfig = { name, mountStrategy: 'eager' };
    }
    registerComponent(Heir);

    const el = render(name, {}, OFFSCREEN);
    await settle();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('dynamic data-mount', () => {
  it('replaces a waiting strategy when the attribute changes', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible' }, OFFSCREEN);
    await observed();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();

    el.setAttribute('data-mount', 'eager');
    await settle();
    expect(instanceOf(el, name)?.$isMounted).toBe(true);
  });
});

describe('invalid data-mount', () => {
  it.each(['eagre', 'media:', 'visible:not-a-root-margin'])(
    'keeps %j inert, reports it once, and accepts a later correction',
    async (strategy) => {
      const { name } = defineTracked();
      const events: CustomEvent<ToolkitDiagnosticDetail>[] = [];
      const el = document.createElement('div');
      el.setAttribute('data-component', name);
      el.setAttribute('data-mount', strategy);
      el.addEventListener(EVENTS.diagnostic, (event) => {
        event.preventDefault();
        events.push(event as CustomEvent<ToolkitDiagnosticDetail>);
      });
      document.body.append(el);

      await observed();

      expect(el[INSTANCES]?.get(name)).toBeUndefined();
      expect(events).toHaveLength(1);
      const failure = events[0].detail.error;
      expect(failure).toBeInstanceOf(Error);
      expect(events[0]).toMatchObject({
        target: el,
        cancelable: true,
        defaultPrevented: true,
      });
      expect(events[0].detail).toEqual({
        severity: 'error',
        code: DIAGNOSTICS.component.invalidMountStrategy,
        message: `Failed to apply mount strategy "${strategy}" to component "${name}".`,
        error: failure,
        component: name,
      });

      // A same-value mutation reconciles the element, but the inert controller
      // remains current and must not report or schedule itself again.
      el.setAttribute('data-mount', strategy);
      await observed();
      expect(events).toHaveLength(1);

      el.setAttribute('data-mount', 'eager');
      await settle();
      expect(instanceOf(el, name)?.$isMounted).toBe(true);
    },
  );

  it('does not stop a valid sibling in the same reconciliation batch', async () => {
    const broken = defineTracked();
    const healthy = defineTracked();
    const diagnostics: ToolkitDiagnosticDetail[] = [];

    const brokenEl = document.createElement('div');
    brokenEl.setAttribute('data-component', broken.name);
    brokenEl.setAttribute('data-mount', 'in-view:not-a-root-margin');
    brokenEl.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    });
    const healthyEl = document.createElement('div');
    healthyEl.setAttribute('data-component', healthy.name);
    document.body.append(brokenEl, healthyEl);

    await observed();

    expect(brokenEl[INSTANCES]?.get(broken.name)).toBeUndefined();
    expect(diagnostics).toHaveLength(1);
    expect(instanceOf(healthyEl, healthy.name)?.$isMounted).toBe(true);
  });
});

describe('teardown', () => {
  it('stops a parameterized viewport strategy when the element leaves the document', async () => {
    const { name } = defineTracked();
    const el = render(name, { 'data-mount': 'visible:200px' }, OFFSCREEN);
    await observed();

    el.remove();
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(el[INSTANCES]?.get(name)).toBeUndefined();
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

    expect(el[INSTANCES]?.get(first.name)).toBeUndefined();
    expect(el[INSTANCES]?.get(second.name)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(instanceOf(el, first.name)?.$isMounted).toBe(true);
    expect(instanceOf(el, second.name)?.$isMounted).toBe(true);
  });
});
