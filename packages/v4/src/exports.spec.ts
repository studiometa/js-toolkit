import { describe, expect, it } from 'vitest';
import { clamp, smoothTo } from '@studiometa/js-toolkit-v4/utils';
import { Base, useScrollProgress, withScrollProgress } from '@studiometa/js-toolkit-v4';
import useScrollProgressSubpath from '@studiometa/js-toolkit-v4/useScrollProgress';
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

  it('exports scroll progress from the root and symbol subpaths', () => {
    expect(useScrollProgress).toBe(useScrollProgressSubpath);
    expect(withScrollProgress).toBe(withScrollProgressSubpath);
  });
});
