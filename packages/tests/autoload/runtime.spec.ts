import { Base, getInstances } from '@studiometa/js-toolkit';
import {
  readEagerTokens,
  registerManifest,
  registerManifests,
  type AutoloadRuntime,
  type ComponentManifest,
  type ComponentManifestEntry,
  type LoaderDependencies,
} from '@studiometa/js-toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

const RUNTIME_KEY = Symbol.for('@studiometa/js-toolkit/autoload/runtime');

class First extends Base {
  static config = { name: 'First' };
}
class Second extends Base {
  static config = { name: 'Second' };
}

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

/** A MutationObserver mock that counts constructions so we can assert how many loaders started. */
class CountingMutationObserver {
  static instances: CountingMutationObserver[] = [];

  constructor(_callback: MutationCallback) {
    CountingMutationObserver.instances.push(this);
  }

  observe(): void {}
  disconnect(): void {}
  takeRecords(): MutationRecord[] {
    return [];
  }
}

function dependencies(overrides: Partial<LoaderDependencies> = {}): Partial<LoaderDependencies> {
  return {
    registerComponent: vi.fn(async () => []),
    console: { warn: vi.fn(), error: vi.fn() },
    MutationObserver: CountingMutationObserver as unknown as typeof MutationObserver,
    IntersectionObserver: undefined,
    ...overrides,
  };
}

/** Build a fresh, isolated HTML document with the given body markup and eager `<meta>` contents. */
function createDocument(bodyHtml = '', eagerContents: string[] = []): Document {
  const documentObject = document.implementation.createHTMLDocument('runtime test');
  for (const content of eagerContents) {
    const meta = documentObject.createElement('meta');
    meta.name = 'js-toolkit:eager';
    meta.content = content;
    documentObject.head.append(meta);
  }
  documentObject.body.innerHTML = bodyHtml;
  return documentObject;
}

async function settle(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await Promise.resolve();
  }
}

/** Flush js-toolkit's macrotask mount queue on top of the microtask queue. */
async function settleToolkit(): Promise<void> {
  for (let index = 0; index < 8; index += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  await settle();
}

afterEach(() => {
  const host = globalThis as unknown as Record<PropertyKey, unknown>;
  const runtime = host[RUNTIME_KEY] as AutoloadRuntime | undefined;
  runtime?.handle?.stop();
  delete host[RUNTIME_KEY];
  // Reset js-toolkit's global instance registry so real `registerComponent` tests stay isolated
  // from each other and from retries (the storage lazily re-creates on next access).
  delete host.__JS_TOOLKIT_INSTANCES__;
  delete host.__JS_TOOLKIT_ELEMENTS__;
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  CountingMutationObserver.instances = [];
  vi.restoreAllMocks();
});

describe('readEagerTokens', () => {
  it('returns an empty list when no eager meta is present', () => {
    expect(readEagerTokens(createDocument())).toEqual([]);
  });

  it('splits, trims, dedupes and drops empty tokens from a single meta', () => {
    const documentObject = createDocument('', ['  Accordion , Action ,, Accordion ,Modal ']);
    expect(readEagerTokens(documentObject)).toEqual(['Accordion', 'Action', 'Modal']);
  });

  it('concatenates the content of several eager metas in document order', () => {
    const documentObject = createDocument('', ['Accordion, Action', 'Action, Modal']);
    expect(readEagerTokens(documentObject)).toEqual(['Accordion', 'Action', 'Modal']);
  });
});

describe('registerManifest', () => {
  it('coalesces manifests registered synchronously into a single loader over the composed set', async () => {
    const firstLoad = vi.fn(async () => First);
    const secondLoad = vi.fn(async () => Second);
    const register = vi.fn(async () => []);
    const globalObject = {};
    const documentObject = createDocument(`
      <div data-component="First"></div>
      <div data-component="Second"></div>
    `);
    const deps = dependencies({ registerComponent: register });

    // Mirror `import './ui'; import './ui-mapbox'` at the top of a module: both manifests register
    // synchronously, before any microtask flushes.
    const runtimeA = registerManifest(
      { First: entry('First', { load: firstLoad }) },
      { document: documentObject, globalObject, version: 'test', dependencies: deps },
    );
    const runtimeB = registerManifest(
      { Second: entry('Second', { load: secondLoad }) },
      { document: documentObject, globalObject, version: 'test', dependencies: deps },
    );
    await settle();

    // A single shared runtime, a single loader (one MutationObserver), both tokens discovered.
    expect(runtimeB).toBe(runtimeA);
    expect(CountingMutationObserver.instances).toHaveLength(1);
    expect(firstLoad).toHaveBeenCalledOnce();
    expect(secondLoad).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith(First, 'First');
    expect(register).toHaveBeenCalledWith(Second, 'Second');
  });

  it('passes the eager <meta> tokens through to the loader as forced-eager components', async () => {
    const load = vi.fn(async () => First);
    const globalObject = {};
    const documentObject = createDocument('<div data-component="Deferred"></div>', ['Deferred']);

    registerManifest(
      { Deferred: entry('Deferred', { strategy: 'visible', load }) },
      { document: documentObject, globalObject, version: 'test', dependencies: dependencies() },
    );
    await settle();

    // The `visible` component loaded immediately because the eager meta forced it, with no
    // IntersectionObserver ever created.
    expect(load).toHaveBeenCalledOnce();
  });

  it('starts a fresh loader for a manifest registered after the first flush', async () => {
    const firstLoad = vi.fn(async () => First);
    const secondLoad = vi.fn(async () => Second);
    const globalObject = {};
    const documentObject = createDocument(`
      <div data-component="First"></div>
      <div data-component="Second"></div>
    `);
    const deps = dependencies();

    registerManifest(
      { First: entry('First', { load: firstLoad }) },
      { document: documentObject, globalObject, version: 'test', dependencies: deps },
    );
    await settle();
    expect(CountingMutationObserver.instances).toHaveLength(1);
    expect(firstLoad).toHaveBeenCalledOnce();
    expect(secondLoad).not.toHaveBeenCalled();

    // Late registration (a separate tick): not dropped, it triggers a fresh start.
    registerManifest(
      { Second: entry('Second', { load: secondLoad }) },
      { document: documentObject, globalObject, version: 'test', dependencies: deps },
    );
    await settle();
    expect(CountingMutationObserver.instances).toHaveLength(2);
    expect(secondLoad).toHaveBeenCalledOnce();
  });

  it('does not double-mount already-mounted components when it restarts (real registerComponent)', async () => {
    document.body.innerHTML = `
      <div data-component="First"></div>
      <div data-component="Second"></div>
    `;
    const globalObject = {};
    const manifest: ComponentManifest = {
      First: entry('First', { load: async () => First }),
      Second: entry('Second', { load: async () => Second }),
    };

    registerManifest(manifest, { globalObject, version: 'test' });
    await settleToolkit();
    expect([...getInstances(First)]).toHaveLength(1);
    expect([...getInstances(Second)]).toHaveLength(1);

    // Re-registering forces a fresh start over the accumulated set. The previous loader is stopped
    // and a new one re-scans the DOM; the already-mounted instances must be reused, not duplicated.
    registerManifest(manifest, { globalObject, version: 'test' });
    await settleToolkit();

    expect([...getInstances(First)]).toHaveLength(1);
    expect([...getInstances(Second)]).toHaveLength(1);
  });

  it('reuses the runtime for a matching version and warns + no-ops on a conflicting one', async () => {
    const globalObject = {};
    const logger = { warn: vi.fn() };
    const documentObject = createDocument('<div data-component="First"></div>');
    const baseOptions = {
      document: documentObject,
      globalObject,
      console: logger,
      dependencies: dependencies(),
    };

    const first = registerManifest({ First: entry('First') }, { ...baseOptions, version: '1.0.0' });
    const repeated = registerManifest(
      { First: entry('First') },
      { ...baseOptions, version: '1.0.0' },
    );
    const conflicting = registerManifest(
      { First: entry('First') },
      { ...baseOptions, version: '2.0.0' },
    );
    await settle();

    expect(repeated).toBe(first);
    expect(conflicting).toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith(
      '[@studiometa/js-toolkit/autoload] A conflicting runtime (version 1.0.0) is already active; version 2.0.0 was ignored.',
    );
    // Only one loader was ever created despite the three calls.
    expect(CountingMutationObserver.instances).toHaveLength(1);
  });

  it('is inert until called: importing the package registers nothing on its own', async () => {
    const register = vi.fn(async () => []);
    const documentObject = createDocument('<div data-component="First"></div>');
    const manifest: ComponentManifest = { First: entry('First') };

    // Simply having a manifest in hand does nothing.
    await settle();
    expect(register).not.toHaveBeenCalled();

    // Only calling registerManifest activates discovery.
    registerManifest(manifest, {
      document: documentObject,
      globalObject: {},
      version: 'test',
      dependencies: dependencies({ registerComponent: register }),
    });
    await settle();
    expect(register).toHaveBeenCalledWith(First, 'First');
  });
});

describe('registerManifests', () => {
  it('registers every manifest in order into the shared runtime', async () => {
    document.body.innerHTML = `
      <div data-component="First"></div>
      <div data-component="Second"></div>
    `;
    const firstLoad = vi.fn(async () => First);
    const secondLoad = vi.fn(async () => Second);

    registerManifests(
      { First: entry('First', { load: firstLoad }) },
      { Second: entry('Second', { load: secondLoad }) },
    );
    await settleToolkit();

    expect(firstLoad).toHaveBeenCalledOnce();
    expect(secondLoad).toHaveBeenCalledOnce();
    expect([...getInstances(First)]).toHaveLength(1);
    expect([...getInstances(Second)]).toHaveLength(1);
  });

  it('lets the last manifest win on a token collision', async () => {
    document.body.innerHTML = '<div data-component="Shared"></div>';
    const baseLoad = vi.fn(async () => First);
    const overrideLoad = vi.fn(async () => Second);

    registerManifests(
      { Shared: entry('Shared', { load: baseLoad }) },
      { Shared: entry('Shared', { load: overrideLoad }) },
    );
    await settleToolkit();

    expect(baseLoad).not.toHaveBeenCalled();
    expect(overrideLoad).toHaveBeenCalledOnce();
    expect([...getInstances(Second)]).toHaveLength(1);
    expect([...getInstances(First)]).toHaveLength(0);
  });

  it('returns undefined when no manifest is passed', () => {
    expect(registerManifests()).toBeUndefined();
  });
});
