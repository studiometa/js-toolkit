import { describe, it, expect } from 'vitest';
import {
  loadElement,
  loadIframe,
  loadImage,
  loadLink,
  loadScript,
  memo,
  createElement as h,
} from '@studiometa/js-toolkit/utils';

const items = [
  [
    'iframe',
    'src',
    HTMLIFrameElement,
    loadIframe,
    '/public/iframe.html',
    { appendTo: document.body },
  ],
  ['img', 'src', HTMLImageElement, loadImage, '/public/image.png'],
  ['link', 'href', HTMLLinkElement, loadLink, '/public/style.css'],
  [
    'script',
    'src',
    HTMLScriptElement,
    loadScript,
    '/public/script.js',
    { appendTo: document.head },
  ],
] as const;

describe('The `loadElement` utility function', () => {
  for (const [name, prop, type, fn, url, options] of items) {
    it(`should load a ${name}`, async () => {
      const { event, element } = await loadElement(url, name, options);
      expect(element).toBeInstanceOf(type);
      expect(element[prop]).toBe(url);
      expect(event.type).toBe('load');
    });

    it(`should load a ${name} and add it to the DOM`, async () => {
      const div = h('div');
      document.body.append(div);
      const { event, element } = await loadElement(url, name, {
        appendTo: div,
      });
      expect(element).toBeInstanceOf(type);
      expect(element[prop]).toBe(url);
      expect(div.contains(element)).toBe(true);
      expect(event.type).toBe('load');
    });

    it('should work with the memo util', async () => {
      const memoLoadElement = memo(loadElement);
      const a = memoLoadElement(url, name, options);
      const b = memoLoadElement(url, name, options);
      expect(a).toBe(b);
      const [aa, bb] = await Promise.all([a, b]);
      expect(aa.element).toBe(aa.element);
      expect(aa.event).toBe(bb.event);
    });

    if (fn) {
      it(`should provide an alias ${fn.name}`, async () => {
        const { event, element } = await fn(url);
        expect(element).toBeInstanceOf(type);
        expect(element[prop]).toBe(url);
        expect(event.type).toBe('load');
      });

      it(`should provide an alias ${fn.name} compatible with the memo util`, async () => {
        const memoFn = memo(fn);
        const a = memoFn(url);
        const b = memoFn(url);
        expect(a).toBe(b);
        const [aa, bb] = await Promise.all([a, b]);
        expect(aa).toBe(bb);
        expect(aa.element).toBe(aa.element);
        expect(aa.event).toBe(bb.event);
      });
    }
  }
});

describe('The loadScript function', () => {
  it('should append the script to the <head> by default', async () => {
    const { event, element } = await loadScript('#fake-url');
    expect(element).toBeInstanceOf(HTMLScriptElement);
    expect(element.src).toBe('#fake-url');
    expect(event.type).toBe('load');
    expect(document.head.contains(element)).toBe(true);
  });
});
