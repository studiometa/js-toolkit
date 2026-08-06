import {
  defineManifest,
  fromMetaGlob,
  fromWebpackContext,
  type ModuleRecord,
} from '@studiometa/js-toolkit';
import { afterEach, describe, expect, it, vi } from 'vitest';

class Widget {}
class Other {}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('defineManifest', () => {
  it('derives the token from the module basename without its extension', () => {
    const manifest = defineManifest({
      modules: { './components/MyWidget.ts': async () => ({ MyWidget: Widget }) },
    });

    expect(Object.keys(manifest)).toEqual(['MyWidget']);
    expect(manifest.MyWidget.token).toBe('MyWidget');
  });

  it('uses the directory name when the basename is index', () => {
    const manifest = defineManifest({
      modules: { './a/b/Foo/index.ts': async () => ({ Foo: Widget }) },
    });

    expect(Object.keys(manifest)).toEqual(['Foo']);
  });

  it('resolves the named export matching the token', async () => {
    const manifest = defineManifest({
      modules: { './Widget.ts': async () => ({ Widget, Other }) },
    });

    expect(await manifest.Widget.load()).toBe(Widget);
  });

  it('falls back to the default export when the named export is absent', async () => {
    const manifest = defineManifest({
      modules: { './Widget.ts': async () => ({ default: Widget }) },
    });

    expect(await manifest.Widget.load()).toBe(Widget);
  });

  it('defaults the strategy to eager and the group to the token', () => {
    const manifest = defineManifest({
      modules: { './Widget.ts': async () => ({ Widget }) },
    });

    expect(manifest.Widget.strategy).toBe('eager');
    expect(manifest.Widget.group).toBe('Widget');
    expect(manifest.Widget.packageName).toBeUndefined();
  });

  it('applies the option-level packageName, strategy and group defaults', () => {
    const manifest = defineManifest({
      packageName: '@my/app',
      strategy: 'visible',
      group: 'app',
      modules: { './Widget.ts': async () => ({ Widget }) },
    });

    expect(manifest.Widget.packageName).toBe('@my/app');
    expect(manifest.Widget.strategy).toBe('visible');
    expect(manifest.Widget.group).toBe('app');
  });

  it('applies per-token overrides matched by the derived token', async () => {
    const manifest = defineManifest({
      strategy: 'eager',
      modules: { './Widget.ts': async () => ({ Special: Widget }) },
      components: {
        Widget: {
          token: 'RenamedWidget',
          strategy: 'visible',
          group: 'custom',
          exportName: 'Special',
          children: ['Child'],
          styles: ['widget.css'],
          integrations: ['analytics'],
        },
      },
    });

    expect(Object.keys(manifest)).toEqual(['RenamedWidget']);
    const entry = manifest.RenamedWidget;
    expect(entry.token).toBe('RenamedWidget');
    expect(entry.strategy).toBe('visible');
    expect(entry.group).toBe('custom');
    expect(entry.exportName).toBe('Special');
    expect(entry.children).toEqual(['Child']);
    expect(entry.styles).toEqual(['widget.css']);
    expect(entry.integrations).toEqual(['analytics']);
    expect(await entry.load()).toBe(Widget);
  });

  it('warns on a duplicate derived token and lets the later module win', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const manifest = defineManifest({
      modules: {
        './first/Widget.ts': async () => ({ Widget }),
        './second/Widget.ts': async () => ({ Widget: Other }),
      },
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '[@studiometa/js-toolkit/autoload] Duplicate component token "Widget"',
      ),
    );
    expect(Object.keys(manifest)).toEqual(['Widget']);
    expect(await manifest.Widget.load()).toBe(Other);
  });
});

describe('fromMetaGlob', () => {
  it('returns a lazy glob record unchanged', () => {
    const glob: ModuleRecord = { './a.ts': async () => ({ A: Widget }) };
    expect(fromMetaGlob(glob)).toBe(glob);
  });

  it('throws when handed an eager glob', () => {
    expect(() => fromMetaGlob({ './a.ts': { A: Widget } })).toThrow(/eager/);
  });
});

describe('fromWebpackContext', () => {
  function createContext(map: Record<string, unknown>, resolve: (value: unknown) => unknown) {
    return Object.assign((id: string) => resolve(map[id]), { keys: () => Object.keys(map) });
  }

  it('maps every key to an importer resolving the synchronous module', async () => {
    const modules = { './A.ts': { A: Widget }, './B.ts': { B: Other } };
    const record = fromWebpackContext(createContext(modules, (value) => value));

    expect(Object.keys(record)).toEqual(['./A.ts', './B.ts']);
    expect(await record['./A.ts']()).toBe(modules['./A.ts']);
    expect(await record['./B.ts']()).toBe(modules['./B.ts']);
  });

  it('unwraps a lazy context that returns promises', async () => {
    const modules = { './A.ts': { A: Widget } };
    const record = fromWebpackContext(createContext(modules, (value) => Promise.resolve(value)));

    expect(await record['./A.ts']()).toBe(modules['./A.ts']);
  });
});
