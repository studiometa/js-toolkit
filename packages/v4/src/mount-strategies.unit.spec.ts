import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { BaseConfig, ComponentManifestEntry, MountStrategy } from './index.js';
import { applyMountStrategy, mountStrategyBehaviour } from './mount-strategies.js';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  readonly observed: Element[] = [];
  disconnects = 0;

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly init?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element): void {
    this.observed.push(target);
  }

  disconnect(): void {
    this.disconnects += 1;
  }

  deliver(target: Element, isIntersecting: boolean): void {
    this.callback(
      [{ target, isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const NativeIntersectionObserver = globalThis.IntersectionObserver;

expectTypeOf<'visible:200px'>().toMatchTypeOf<MountStrategy>();
expectTypeOf<'in-view:200px 0px'>().toMatchTypeOf<MountStrategy>();
expectTypeOf<'in-view:-10% 0px'>().toMatchTypeOf<MountStrategy>();
expectTypeOf<'visible:'>().toMatchTypeOf<MountStrategy>();
expectTypeOf<'interaction:page'>().toMatchTypeOf<MountStrategy>();
expectTypeOf<'visible:200px'>().toMatchTypeOf<NonNullable<BaseConfig['mountStrategy']>>();
expectTypeOf<'in-view:-10% 0px'>().toMatchTypeOf<
  NonNullable<ComponentManifestEntry['mountStrategy']>
>();
// @ts-expect-error only visible and in-view accept viewport parameters
const invalidViewportStrategy: MountStrategy = 'viewport:200px';
void invalidViewportStrategy;
// @ts-expect-error `page` is the only scope the interaction strategy takes
const invalidInteractionScope: MountStrategy = 'interaction:document';
void invalidInteractionScope;

describe('mountStrategyBehaviour', () => {
  // The registry schedules against these two facts, so they belong to the
  // module owning the grammar rather than to a list of strategy names
  // maintained beside it.
  it.each([
    ['eager', { eager: true, reversible: false }],
    ['visible', { eager: false, reversible: false }],
    ['visible:200px', { eager: false, reversible: false }],
    ['in-view', { eager: false, reversible: true }],
    ['in-view:', { eager: false, reversible: true }],
    ['in-view:-10% 0px', { eager: false, reversible: true }],
    ['idle', { eager: false, reversible: false }],
    ['interaction', { eager: false, reversible: false }],
    ['interaction:page', { eager: false, reversible: false }],
    ['interaction:nope', { eager: false, reversible: false }],
    ['media:(min-width: 1px)', { eager: false, reversible: true }],
    ['eagre', { eager: false, reversible: false }],
    ['media:', { eager: false, reversible: false }],
  ])('describes %j without applying it', (strategy, behaviour) => {
    expect(mountStrategyBehaviour(strategy)).toEqual(behaviour);
  });
});

describe('applyMountStrategy synchronous evaluation', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts a matching media query before it returns', () => {
    let returned = false;
    const firedAfterReturn: boolean[] = [];

    const applied = applyMountStrategy(document.createElement('div'), 'media:(min-width: 1px)', {
      mount: () => firedAfterReturn.push(returned),
      destroy() {},
    });
    returned = true;

    // The only strategy which can call a hook from inside `applyMountStrategy`.
    // Every caller has to be safe with a teardown it does not hold yet.
    expect(firedAfterReturn).toEqual([false]);
    applied.dispose();
  });

  it.each(['eager', 'visible', 'idle', 'interaction'] as const)(
    'defers every hook of %j past the call',
    (strategy) => {
      const hooks = { mount: vi.fn(), destroy: vi.fn() };

      const applied = applyMountStrategy(document.createElement('div'), strategy, hooks);

      expect(hooks.mount).not.toHaveBeenCalled();
      expect(hooks.destroy).not.toHaveBeenCalled();
      applied.dispose();
    },
  );
});

describe('applyMountStrategy interaction scope', () => {
  it('reads a bare or empty parameter as the element scope', () => {
    for (const strategy of ['interaction', 'interaction:']) {
      const el = document.createElement('div');
      const mount = vi.fn();
      const applied = applyMountStrategy(el, strategy, { mount, destroy: () => {} });

      expect(applied.valid).toBe(true);
      el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      expect(mount).toHaveBeenCalledTimes(1);
      applied.dispose();
    }
  });

  it('refuses a scope it does not know, naming the one it takes', () => {
    const applied = applyMountStrategy(document.createElement('div'), 'interaction:document', {
      mount: () => {},
      destroy: () => {},
    });

    expect(applied.valid).toBe(false);
    expect(applied.error).toBeInstanceOf(TypeError);
    expect((applied.error as TypeError).message).toContain('"page"');
    applied.dispose();
  });
});

describe('applyMountStrategy viewport parameters', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    globalThis.IntersectionObserver =
      FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = NativeIntersectionObserver;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('passes the visible suffix as the exact root margin and remains one-shot', () => {
    const el = document.createElement('div');
    const calls: string[] = [];
    const applied = applyMountStrategy(el, 'visible:200px 0px', {
      mount: () => calls.push('mount'),
      destroy: () => calls.push('destroy'),
    });
    const observer = FakeIntersectionObserver.instances[0];

    expect(observer?.observed).toEqual([el]);
    expect(observer?.init).toEqual({ rootMargin: '200px 0px' });

    observer?.deliver(el, false);
    observer?.deliver(el, true);
    expect(calls).toEqual(['mount']);
    expect(observer?.disconnects).toBe(1);

    applied.dispose();
    expect(observer?.disconnects).toBe(2);
  });

  it('passes a negative in-view suffix and keeps the strategy reversible', () => {
    const el = document.createElement('div');
    const calls: string[] = [];
    const applied = applyMountStrategy(el, 'in-view:-10% 0px', {
      mount: () => calls.push('mount'),
      destroy: () => calls.push('destroy'),
    });
    const observer = FakeIntersectionObserver.instances[0];

    expect(observer?.init).toEqual({ rootMargin: '-10% 0px' });

    observer?.deliver(el, true);
    observer?.deliver(el, false);
    observer?.deliver(el, true);
    expect(calls).toEqual(['mount', 'destroy', 'mount']);
    expect(observer?.disconnects).toBe(0);

    applied.dispose();
    expect(observer?.disconnects).toBe(1);
  });

  it.each(['visible', 'visible:', 'in-view', 'in-view:'] as const)(
    'treats %s as a viewport strategy without an observer init',
    (strategy) => {
      const el = document.createElement('div');
      applyMountStrategy(el, strategy, { mount() {}, destroy() {} });

      expect(FakeIntersectionObserver.instances.at(-1)?.init).toBeUndefined();
    },
  );

  it('reports an invalid root margin without falling back or stopping DOM work', () => {
    const failure = new DOMException('rootMargin must use pixels or percent', 'SyntaxError');
    globalThis.IntersectionObserver = class {
      constructor() {
        throw failure;
      }
    } as unknown as typeof IntersectionObserver;
    const hooks = { mount: vi.fn(), destroy: vi.fn() };

    const applied = applyMountStrategy(
      document.createElement('div'),
      'in-view:not-a-root-margin',
      hooks,
    );

    expect(hooks.mount).not.toHaveBeenCalled();
    expect(hooks.destroy).not.toHaveBeenCalled();
    expect(applied).toMatchObject({ valid: false, error: failure });
    expect(() => applied.dispose()).not.toThrow();
  });

  it.each(['eagre', 'media:', 'media:   '])(
    'rejects invalid strategy %j without mounting it',
    (strategy) => {
      const hooks = { mount: vi.fn(), destroy: vi.fn() };

      const applied = applyMountStrategy(document.createElement('div'), strategy, hooks);

      expect(applied.valid).toBe(false);
      expect(applied.error).toBeInstanceOf(TypeError);
      expect(hooks.mount).not.toHaveBeenCalled();
      expect(hooks.destroy).not.toHaveBeenCalled();
      expect(() => applied.dispose()).not.toThrow();
    },
  );
});
