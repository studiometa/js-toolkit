import { Base } from '@studiometa/js-toolkit';
import {
  autoload,
  composeManifests,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LoaderDependencies,
} from '@studiometa/js-toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

class First extends Base {}
class Second extends Base {}

function entry(
  token: string,
  overrides: Partial<ComponentManifestEntry> = {},
): ComponentManifestEntry {
  return {
    token,
    packageName: '@studiometa/ui',
    subpath: token,
    exportName: token,
    strategy: 'eager',
    group: 'test',
    load: vi.fn(async () => First),
    ...overrides,
  };
}

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    IntersectionObserverMock.instances.push(this);
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(): void {
    this.callback(
      [{ isIntersecting: true, target: this.elements[0] } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

function dependencies(overrides: Partial<LoaderDependencies> = {}): Partial<LoaderDependencies> {
  return {
    document,
    registerComponent: vi.fn(async () => []),
    console: { warn: vi.fn(), error: vi.fn() },
    MutationObserver: undefined,
    IntersectionObserver: IntersectionObserverMock as unknown as typeof IntersectionObserver,
    ...overrides,
  };
}

async function settle(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

afterEach(() => {
  document.body.innerHTML = '';
  IntersectionObserverMock.instances = [];
  vi.useRealTimers();
});

describe('composeManifests', () => {
  it('merges manifests with later entries winning on token collision', () => {
    const base = { Shared: entry('Shared'), OnlyBase: entry('OnlyBase') };
    const override = {
      Shared: entry('Shared', { group: 'override' }),
      OnlyOverride: entry('OnlyOverride'),
    };

    const composed = composeManifests([base, override]);

    expect(Object.keys(composed).sort()).toEqual(['OnlyBase', 'OnlyOverride', 'Shared']);
    expect(composed.Shared.group).toBe('override');
  });

  it('returns an empty manifest for an empty input', () => {
    expect(composeManifests([])).toEqual({});
  });
});

describe('autoload', () => {
  it('has no side effects until it is called', async () => {
    const load = vi.fn(async () => First);
    const register = vi.fn(async () => []);
    document.body.innerHTML = '<div data-component="First"></div>';
    const manifest: ComponentManifest = { First: entry('First', { load }) };

    // Merely composing the manifest must not import or register anything.
    composeManifests([manifest]);
    await settle();
    expect(load).not.toHaveBeenCalled();
    expect(register).not.toHaveBeenCalled();

    // Only calling autoload() starts discovery.
    autoload({
      manifests: [manifest],
      dependencies: dependencies({ registerComponent: register }),
    });
    await settle();
    expect(load).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith(First, 'First');
  });

  it('composes several manifests and discovers tokens from each', async () => {
    const firstLoad = vi.fn(async () => First);
    const secondLoad = vi.fn(async () => Second);
    document.body.innerHTML = `
      <div data-component="First"></div>
      <div data-component="Second"></div>
    `;

    autoload({
      manifests: [
        { First: entry('First', { load: firstLoad }) },
        { Second: entry('Second', { load: secondLoad }) },
      ],
      dependencies: dependencies(),
    });
    await settle();

    expect(firstLoad).toHaveBeenCalledOnce();
    expect(secondLoad).toHaveBeenCalledOnce();
  });

  it('loads eager components immediately and defers lazy ones', async () => {
    const eagerLoad = vi.fn(async () => First);
    const lazyLoad = vi.fn(async () => Second);
    document.body.innerHTML = `
      <div data-component="Eager"></div>
      <div data-component="Lazy"></div>
    `;

    autoload({
      manifests: [
        {
          Eager: entry('Eager', { load: eagerLoad }),
          Lazy: entry('Lazy', { strategy: 'visible', load: lazyLoad }),
        },
      ],
      dependencies: dependencies(),
    });
    await settle();

    expect(eagerLoad).toHaveBeenCalledOnce();
    expect(lazyLoad).not.toHaveBeenCalled();

    IntersectionObserverMock.instances[0].trigger();
    await settle();
    expect(lazyLoad).toHaveBeenCalledOnce();
  });

  it('force-loads tokens listed in the eager option regardless of their strategy', async () => {
    const load = vi.fn(async () => First);
    document.body.innerHTML = '<div data-component="Deferred"></div>';

    autoload({
      manifests: [{ Deferred: entry('Deferred', { strategy: 'visible', load }) }],
      eager: ['Deferred'],
      dependencies: dependencies(),
    });
    await settle();

    // Forced eager: it loaded without any intersection trigger.
    expect(load).toHaveBeenCalledOnce();
    expect(IntersectionObserverMock.instances).toHaveLength(0);
  });

  it('lets a later manifest override an earlier token', async () => {
    const baseLoad = vi.fn(async () => First);
    const overrideLoad = vi.fn(async () => Second);
    document.body.innerHTML = '<div data-component="Shared"></div>';

    autoload({
      manifests: [
        { Shared: entry('Shared', { load: baseLoad }) },
        { Shared: entry('Shared', { load: overrideLoad }) },
      ],
      dependencies: dependencies(),
    });
    await settle();

    expect(baseLoad).not.toHaveBeenCalled();
    expect(overrideLoad).toHaveBeenCalledOnce();
  });

  it('scans only the provided root and returns a stoppable handle', async () => {
    const insideLoad = vi.fn(async () => First);
    const outsideLoad = vi.fn(async () => Second);
    const root = document.createElement('section');
    root.innerHTML = '<div data-component="Inside"></div>';
    document.body.append(root);
    const outside = document.createElement('div');
    outside.dataset.component = 'Outside';
    document.body.append(outside);

    const handle = autoload({
      manifests: [
        {
          Inside: entry('Inside', { load: insideLoad }),
          Outside: entry('Outside', { load: outsideLoad }),
        },
      ],
      root,
      dependencies: dependencies(),
    });
    await settle();

    expect(insideLoad).toHaveBeenCalledOnce();
    expect(outsideLoad).not.toHaveBeenCalled();
    expect(typeof handle.stop).toBe('function');
    expect(Object.keys(handle.manifest).sort()).toEqual(['Inside', 'Outside']);
    handle.stop();
  });
});
