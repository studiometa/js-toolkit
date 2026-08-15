import { describe, expect, expectTypeOf, it } from 'vitest';
import { clamp, smoothTo } from '@studiometa/js-toolkit-v4/utils';
import {
  Base,
  defineManifest,
  fromMetaGlob,
  fromWebpackContext,
  useInView,
  useScrollProgress,
  withInView,
  withScrollProgress,
  type DefineManifestOptions,
  type InViewHook,
  type InViewMixinOptions,
  type InViewProps,
  type ModuleRecord,
  type Service,
  type WebpackContextLike,
} from '@studiometa/js-toolkit-v4';
import defineManifestFromSubpath from '@studiometa/js-toolkit-v4/defineManifest';
import fromMetaGlobFromSubpath from '@studiometa/js-toolkit-v4/fromMetaGlob';
import fromWebpackContextFromSubpath from '@studiometa/js-toolkit-v4/fromWebpackContext';
import useInViewFromSubpath, {
  useInView as namedUseInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/useInView';
import useScrollProgressSubpath from '@studiometa/js-toolkit-v4/useScrollProgress';
import withInViewFromSubpath, {
  withInView as namedWithInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/withInView';
import withScrollProgressSubpath from '@studiometa/js-toolkit-v4/withScrollProgress';

describe('the package entry points', () => {
  it('serves the utils from the /utils subpath', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    const x = smoothTo(3);
    expect(x()).toBe(3);
    x.destroy();
  });

  it('keeps the framework on the root entry, without the utils', async () => {
    expect(typeof Base).toBe('function');
    const root = (await import('@studiometa/js-toolkit-v4')) as Record<string, unknown>;
    expect(root.clamp).toBeUndefined();
    expect(root.smoothTo).toBeUndefined();
  });

  it('serves useInView and withInView from the root and their symbol subpaths', () => {
    expect(typeof useInView).toBe('function');
    expect(useInViewFromSubpath).toBe(useInView);
    expect(namedUseInViewFromSubpath).toBe(useInView);
    expect(withInViewFromSubpath).toBe(withInView);
    expect(namedWithInViewFromSubpath).toBe(withInView);
    expectTypeOf(useInView(document.documentElement)).toEqualTypeOf<Service<InViewProps>>();
    expectTypeOf<InViewHook>().toMatchTypeOf<{
      intersected?: (props: InViewProps) => void;
    }>();
    expectTypeOf<InViewMixinOptions>().toMatchTypeOf<IntersectionObserverInit>();
  });

  it('exports manifest generation from the root and symbol subpaths', () => {
    expect(defineManifestFromSubpath).toBe(defineManifest);
    expect(fromMetaGlobFromSubpath).toBe(fromMetaGlob);
    expect(fromWebpackContextFromSubpath).toBe(fromWebpackContext);
    expectTypeOf<DefineManifestOptions>().toMatchTypeOf<{
      modules: ModuleRecord;
      mountStrategy?: string;
    }>();
    expectTypeOf<WebpackContextLike>().toBeCallableWith('./Widget.ts');
  });

  it('exports scroll progress from the root and symbol subpaths', () => {
    expect(useScrollProgress).toBe(useScrollProgressSubpath);
    expect(withScrollProgress).toBe(withScrollProgressSubpath);
  });
});
