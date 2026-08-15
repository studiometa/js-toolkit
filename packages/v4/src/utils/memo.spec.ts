import { describe, expect, it, vi } from 'vitest';
import { memo } from './memo.js';

describe('memo', () => {
  it('computes once per distinct key', () => {
    const fn = vi.fn((name: string) => name.toUpperCase());
    const upper = memo(fn);

    expect(upper('a')).toBe('A');
    expect(upper('a')).toBe('A');
    expect(upper('b')).toBe('B');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('hands back the same object, so a derived value is built once', () => {
    const scoped = memo((attribute: string) => [`${attribute}:s`, `${attribute}:l`]);
    expect(scoped('data-option-columns')).toBe(scoped('data-option-columns'));
  });

  it('memoises a result of `undefined` instead of recomputing it', () => {
    const fn = vi.fn(() => undefined);
    const nothing = memo(fn);

    nothing();
    nothing();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('caches one value for a function taking no argument', () => {
    let count = 0;
    const next = memo(() => (count += 1));

    expect(next()).toBe(1);
    expect(next()).toBe(1);
    next.clear();
    expect(next()).toBe(2);
  });

  it('keys an object by identity, not by shape', () => {
    const fn = vi.fn((el: HTMLElement) => el.tagName);
    const tag = memo(fn);
    const one = document.createElement('div');
    const two = document.createElement('div');

    expect(tag(one)).toBe('DIV');
    expect(tag(one)).toBe('DIV');
    expect(tag(two)).toBe('DIV');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('forgets both stores on `clear()`', () => {
    const fn = vi.fn((key: unknown) => key);
    const identity = memo(fn);
    const el = document.createElement('div');

    identity('a');
    identity(el);
    expect(fn).toHaveBeenCalledTimes(2);

    identity.clear();
    identity('a');
    identity(el);
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('distinguishes the keys a joined-string key would collide', () => {
    const fn = vi.fn((key: string) => key.length);
    const length = memo(fn);

    expect(length('abc')).toBe(3);
    expect(length('ab')).toBe(2);
    expect(length('')).toBe(0);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('keeps `null` and `undefined` apart', () => {
    const fn = vi.fn((key: unknown) => String(key));
    const label = memo(fn);

    expect(label(null)).toBe('null');
    expect(label(undefined)).toBe('undefined');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
