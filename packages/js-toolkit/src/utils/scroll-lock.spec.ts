import { afterEach, describe, expect, it } from 'vitest';
import { lockScroll } from './scroll-lock.js';

afterEach(() => {
  document.documentElement.style.overflow = '';
  document.body.innerHTML = '';
});

function scrollable(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = 'width: 100px; height: 100px; overflow: auto;';
  document.body.append(el);
  return el;
}

describe('lockScroll', () => {
  it('locks the document element by default and puts it back on release', () => {
    const release = lockScroll();
    expect(document.documentElement.style.overflow).toBe('hidden');

    release();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('keeps the lock until the last holder releases it', () => {
    const first = lockScroll();
    const second = lockScroll();

    // The drawer is still open behind the dialog that just closed.
    second();
    expect(document.documentElement.style.overflow).toBe('hidden');

    first();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('restores the inline value it found, not an empty one', () => {
    document.documentElement.style.overflow = 'clip';

    const release = lockScroll();
    expect(document.documentElement.style.overflow).toBe('hidden');

    release();
    expect(document.documentElement.style.overflow).toBe('clip');
  });

  it('releases once, however many times it is called', () => {
    const first = lockScroll();
    const second = lockScroll();

    second();
    second();
    second();
    expect(document.documentElement.style.overflow).toBe('hidden');

    first();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('counts each target on its own', () => {
    const drawer = scrollable();
    const page = lockScroll();
    const inner = lockScroll(drawer);

    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(drawer.style.overflow).toBe('hidden');

    inner();
    expect(drawer.style.overflow).toBe('auto');
    expect(document.documentElement.style.overflow).toBe('hidden');

    page();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('locks again after the count reached zero', () => {
    lockScroll()();
    const release = lockScroll();

    expect(document.documentElement.style.overflow).toBe('hidden');
    release();
    expect(document.documentElement.style.overflow).toBe('');
  });
});
