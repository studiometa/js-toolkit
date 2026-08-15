import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { BaseConfig, ComponentManifestEntry, MountStrategy } from './index.js';
import { applyMountStrategy } from './mount-strategies.js';

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
expectTypeOf<'visible:200px'>().toMatchTypeOf<NonNullable<BaseConfig['mountStrategy']>>();
expectTypeOf<'in-view:-10% 0px'>().toMatchTypeOf<
  NonNullable<ComponentManifestEntry['mountStrategy']>
>();
// @ts-expect-error only visible and in-view accept viewport parameters
const invalidViewportStrategy: MountStrategy = 'viewport:200px';
void invalidViewportStrategy;

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
