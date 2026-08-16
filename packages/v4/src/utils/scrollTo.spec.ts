import { afterEach, describe, expect, it, vi } from 'vitest';
import { cdp } from 'vitest/browser';
import type {} from '@vitest/browser-playwright';
import { createElement } from './dom.js';
import { scrollTo, SCROLL_AXES } from './scrollTo.js';

/** A page taller and wider than the viewport, with a target inside it. */
function givenAScrollablePage(): HTMLElement {
  const target = createElement('div');
  target.style.cssText = 'width: 100px; height: 100px; margin: 2000px 0 0 1500px;';
  target.id = 'target';
  document.body.append(target);
  document.body.style.cssText = 'margin: 0; width: 4000px; height: 5000px;';
  return target;
}

/** A scrolling element with a border, and a target inside its content. */
function givenAScrollingElement(): { root: HTMLElement; target: HTMLElement } {
  const target = createElement('div');
  target.style.cssText = 'width: 50px; height: 50px; margin: 600px 0 0 700px;';
  const content = createElement('div', [target]);
  // Room past the target, so a scroll to it is not cut short by the extents.
  content.style.cssText = 'width: 3000px; height: 3000px;';
  const root = createElement('div', [content]);
  root.style.cssText = 'width: 200px; height: 200px; overflow: auto; border: 5px solid;';
  document.body.append(root);
  return { root, target };
}

afterEach(async () => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
  window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
  await cdp().send('Emulation.setEmulatedMedia', { features: [] });
});

describe('scrollTo', () => {
  it('scrolls the window to a distance, on the y axis by default', () => {
    givenAScrollablePage();

    expect(scrollTo(800, { behavior: 'instant' })).toEqual({ left: 0, top: 800 });
    expect(window.scrollY).toBe(800);
    expect(window.scrollX).toBe(0);
  });

  it('scrolls on the axis it is given', () => {
    givenAScrollablePage();

    expect(scrollTo(800, { axis: SCROLL_AXES.x, behavior: 'instant' })).toEqual({
      left: 800,
      top: 0,
    });
    expect(scrollTo(300, { axis: SCROLL_AXES.both, behavior: 'instant' })).toEqual({
      left: 300,
      top: 300,
    });
    expect(window.scrollX).toBe(300);
    expect(window.scrollY).toBe(300);
  });

  it('lets a position object name its own axes, whatever the axis option', () => {
    givenAScrollablePage();
    scrollTo({ left: 400, top: 400 }, { axis: SCROLL_AXES.both, behavior: 'instant' });

    // v3 dropped this `left` on the default y axis, which made an explicit
    // request silently do nothing.
    expect(scrollTo({ left: 900 }, { behavior: 'instant' })).toEqual({ left: 900, top: 400 });
    expect(window.scrollX).toBe(900);
    expect(window.scrollY).toBe(400);
  });

  it('scrolls to an element and to a selector alike', () => {
    const target = givenAScrollablePage();
    const expected = target.getBoundingClientRect().top;

    expect(scrollTo(target, { behavior: 'instant' })).toEqual({ left: 0, top: expected });
    window.scrollTo({ top: 0, behavior: 'instant' });
    expect(scrollTo('#target', { behavior: 'instant' })).toEqual({ left: 0, top: expected });
    expect(window.scrollY).toBe(expected);
  });

  it('stops short of the element by its scroll-margin', () => {
    const target = givenAScrollablePage();
    const withoutMargin = scrollTo(target, { behavior: 'instant' }).top;

    window.scrollTo({ top: 0, behavior: 'instant' });
    target.style.scrollMarginTop = '40px';

    expect(scrollTo(target, { behavior: 'instant' }).top).toBe(withoutMargin - 40);
  });

  it('stops short of the target by the offset', () => {
    givenAScrollablePage();

    expect(scrollTo(1000, { offset: 100, behavior: 'instant' })).toEqual({ left: 0, top: 900 });
    expect(scrollTo({ left: 1000, top: 1000 }, { offset: 100, behavior: 'instant' })).toEqual({
      left: 900,
      top: 900,
    });
  });

  it('clamps to the scrollable range at both ends', () => {
    givenAScrollablePage();
    const max = document.documentElement.scrollHeight - window.innerHeight;

    expect(scrollTo(99999, { behavior: 'instant' })).toEqual({ left: 0, top: max });
    // v3 clamped the far end only, so an offset past the start scrolled nowhere.
    expect(scrollTo(50, { offset: 200, behavior: 'instant' })).toEqual({ left: 0, top: 0 });
  });

  it('is a no-op on a selector that matches nothing', () => {
    givenAScrollablePage();
    scrollTo(500, { behavior: 'instant' });

    expect(scrollTo('#nothing-here')).toEqual({ left: 0, top: 500 });
    expect(window.scrollY).toBe(500);
  });

  it('scrolls a root element, in its own content coordinates', () => {
    const { root, target } = givenAScrollingElement();

    // v3 read `scrollTop` as the left position and offset the target by the
    // window scroll, so neither axis landed on an element inside a scroller.
    expect(
      scrollTo(target, { rootElement: root, axis: SCROLL_AXES.both, behavior: 'instant' }),
    ).toEqual({ left: 700, top: 600 });
    expect(root.scrollLeft).toBe(700);
    expect(root.scrollTop).toBe(600);
  });

  it('clamps a root element to its own scrollable range', () => {
    const { root } = givenAScrollingElement();
    const max = root.scrollHeight - root.clientHeight;

    expect(scrollTo(99999, { rootElement: root, behavior: 'instant' }).top).toBe(max);
    expect(root.scrollTop).toBe(max);
  });

  it('asks for a smooth scroll by default', () => {
    givenAScrollablePage();
    const spy = vi.spyOn(window, 'scrollTo');

    scrollTo(100);

    expect(spy).toHaveBeenCalledWith({ left: 0, top: 100, behavior: 'smooth' });
    spy.mockRestore();
  });

  it('asks for an instant scroll for a reader who turned motion down', async () => {
    givenAScrollablePage();
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    const spy = vi.spyOn(window, 'scrollTo');

    scrollTo(100);

    expect(spy).toHaveBeenCalledWith({ left: 0, top: 100, behavior: 'instant' });
    spy.mockRestore();
  });

  it('reads the motion preference at every call, not once at load', async () => {
    givenAScrollablePage();
    const spy = vi.spyOn(window, 'scrollTo');

    scrollTo(100);
    await cdp().send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    scrollTo(200);

    expect(spy.mock.calls.map(([options]) => options)).toEqual([
      { left: 0, top: 100, behavior: 'smooth' },
      { left: 0, top: 200, behavior: 'instant' },
    ]);
    spy.mockRestore();
  });

  it('lets the caller override the behavior', () => {
    givenAScrollablePage();
    const spy = vi.spyOn(window, 'scrollTo');

    scrollTo(100, { behavior: 'auto' });

    expect(spy).toHaveBeenCalledWith({ left: 0, top: 100, behavior: 'auto' });
    spy.mockRestore();
  });
});
