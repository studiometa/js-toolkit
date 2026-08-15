import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Base } from './Base.js';
import {
  defineManifest,
  fromMetaGlob,
  fromWebpackContext,
  type DefineManifestOptions,
  type ModuleRecord,
  type WebpackContextLike,
} from './manifest.js';
import { registerManifest } from './registry.js';
import { getInstance, resetDom, settle } from './test-utils.js';

class Widget {}
class Other {}

afterEach(async () => {
  vi.restoreAllMocks();
  await resetDom();
});

describe('defineManifest', () => {
  it.each([
    ['./components/MyWidget.ts', 'MyWidget'],
    ['./a/b/Foo/index.ts', 'Foo'],
    ['./components/MyWidget.test.ts', 'MyWidget.test'],
    ['//./components//Nested.ts', 'Nested'],
  ])('derives %s as %s', (path, token) => {
    expect(
      Object.keys(
        defineManifest({
          modules: { [path]: async () => ({}) },
        }),
      ),
    ).toEqual([token]);
  });

  it('preserves the v3 edge behavior for a top-level index and empty path', () => {
    expect(Object.keys(defineManifest({ modules: { 'index.ts': async () => ({}) } }))).toEqual([
      'index',
    ]);
    expect(Object.keys(defineManifest({ modules: { '': async () => ({}) } }))).toEqual(['']);
  });

  it('returns an empty manifest for an empty module record', () => {
    expect(defineManifest({ modules: {} })).toEqual({});
  });

  it('keeps importers unchanged and never calls them eagerly', () => {
    const implicit = vi.fn(async () => ({ Widget }));
    const eager = vi.fn(async () => ({ Other }));
    const manifest = defineManifest({
      modules: { './Widget.ts': implicit, './Other.ts': eager },
    });
    const eagerManifest = defineManifest({
      modules: { './Other.ts': eager },
      mountStrategy: 'eager',
    });

    expect(manifest.Widget).toBe(implicit);
    expect(manifest.Other).toBe(eager);
    expect(eagerManifest.Other).toBe(eager);
    expect(implicit).not.toHaveBeenCalled();
    expect(eager).not.toHaveBeenCalled();
  });

  it('warns for a duplicate token and keeps the first path and importer', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const first = vi.fn(async () => ({ Widget }));
    const second = vi.fn(async () => ({ Widget: Other }));
    const manifest = defineManifest({
      modules: {
        './first/Widget.ts': first,
        './second/Widget.ts': second,
      },
    });

    expect(manifest.Widget).toBe(first);
    expect(warn).toHaveBeenCalledWith(
      '[manifest] "Widget" is already derived from "./first/Widget.ts"; ignoring "./second/Widget.ts".',
    );
  });

  it('applies one non-eager mount strategy to every generated entry', () => {
    const widget = vi.fn(async () => ({ Widget }));
    const other = vi.fn(async () => ({ Other }));
    const manifest = defineManifest({
      modules: { './Widget.ts': widget, './Other.ts': other },
      mountStrategy: 'visible',
    });

    expect(manifest).toEqual({
      Widget: { load: widget, mountStrategy: 'visible' },
      Other: { load: other, mountStrategy: 'visible' },
    });
    expect(widget).not.toHaveBeenCalled();
    expect(other).not.toHaveBeenCalled();
  });

  it('accepts realistic bundler records and public options', () => {
    const viteRecord: Record<string, () => Promise<{ Widget: typeof Widget }>> = {
      './Widget.ts': async () => ({ Widget }),
    };
    const options: DefineManifestOptions = { modules: viteRecord, mountStrategy: 'idle' };

    expectTypeOf(options.modules).toMatchTypeOf<ModuleRecord>();
    expectTypeOf(defineManifest(options)).toMatchTypeOf<
      Record<string, (() => Promise<unknown>) | { load: () => Promise<unknown> }>
    >();
  });
});

describe('fromMetaGlob', () => {
  it('returns a lazy Vite glob record unchanged', () => {
    const glob = { './Widget.ts': async () => ({ Widget }) };

    expect(fromMetaGlob(glob)).toBe(glob);
    expectTypeOf(fromMetaGlob(glob)).toEqualTypeOf<ModuleRecord>();
  });

  it('throws a useful TypeError for an eager value', () => {
    expect(() => fromMetaGlob({ './Widget.ts': { Widget } })).toThrowError(TypeError);
    expect(() => fromMetaGlob({ './Widget.ts': { Widget } })).toThrow(
      '[manifest] fromMetaGlob() expects a lazy glob; "./Widget.ts" is not an importer function. Remove the { eager: true } option.',
    );
  });
});

describe('fromWebpackContext', () => {
  function createContext(
    modules: Record<string, unknown>,
    resolve: (value: unknown) => unknown,
  ): WebpackContextLike {
    return Object.assign(
      vi.fn((key: string) => resolve(modules[key])),
      {
        keys: vi.fn(() => Object.keys(modules)),
      },
    );
  }

  it('calls keys immediately and defers each context call', async () => {
    const context = createContext({ './Widget.ts': { Widget } }, (value) => value);
    const record = fromWebpackContext(context);

    expect(context.keys).toHaveBeenCalledOnce();
    expect(context).not.toHaveBeenCalled();
    expect(await record['./Widget.ts']()).toEqual({ Widget });
    expect(context).toHaveBeenCalledOnce();
  });

  it('normalizes a synchronous result to a promise', () => {
    const module = { Widget };
    const record = fromWebpackContext(createContext({ './Widget.ts': module }, (value) => value));
    const result = record['./Widget.ts']();

    expect(result).toBeInstanceOf(Promise);
    return expect(result).resolves.toBe(module);
  });

  it('flattens a promise result', async () => {
    const module = { Widget };
    const record = fromWebpackContext(
      createContext({ './Widget.ts': module }, (value) => Promise.resolve(value)),
    );

    await expect(record['./Widget.ts']()).resolves.toBe(module);
  });
});

describe('defineManifest with registerManifest', () => {
  it('leaves named and default module resolution to the registry', async () => {
    class ManifestNamed extends Base {
      static config = { name: 'ManifestNamed' };
    }
    class ManifestDefault extends Base {
      static config = { name: 'ManifestDefault' };
    }

    registerManifest(
      defineManifest({
        modules: {
          './ManifestNamed.ts': async () => ({ ManifestNamed }),
          './ManifestDefault.ts': async () => ({ default: ManifestDefault }),
        },
      }),
    );
    const named = document.createElement('div');
    named.setAttribute('data-component', 'ManifestNamed');
    const fallback = document.createElement('div');
    fallback.setAttribute('data-component', 'ManifestDefault');
    document.body.append(named, fallback);
    await settle();

    expect(getInstance(named, 'ManifestNamed')).toBeInstanceOf(ManifestNamed);
    expect(getInstance(fallback, 'ManifestDefault')).toBeInstanceOf(ManifestDefault);
  });
});
