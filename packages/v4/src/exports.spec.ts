import { describe, expect, expectTypeOf, it } from 'vitest';
import { clamp, smoothTo } from '@studiometa/js-toolkit-v4/utils';
import { Base, useInView, type InViewProps, type Service } from '@studiometa/js-toolkit-v4';
import useInViewFromSubpath, {
  useInView as namedUseInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/useInView';

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

  it('serves useInView from the root and its symbol subpath', () => {
    expect(typeof useInView).toBe('function');
    expect(useInViewFromSubpath).toBe(useInView);
    expect(namedUseInViewFromSubpath).toBe(useInView);
    expectTypeOf(useInView(document.documentElement)).toEqualTypeOf<Service<InViewProps>>();
  });
});
