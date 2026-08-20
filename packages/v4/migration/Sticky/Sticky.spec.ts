import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents, type InViewProps, type ScrollProps } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Sentinel } from '../Sentinel/index.js';
import { Sticky } from './Sticky.js';

registerComponents(Sticky, Sentinel);

afterEach(resetDom);

// A `Sentinel` is positioned out of flow in real markup (`absolute bottom-full`),
// so its programmatically set height never adds to the `Sticky` element's own size.
const SENTINEL = '<div data-component="Sentinel" style="position:absolute;bottom:100%"></div>';

function sticky(): string {
  return `
    <div data-component="Sticky">
      ${SENTINEL}
      <div data-ref="inner" style="height:50px"></div>
    </div>`;
}

async function render(markup: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = markup;
  document.body.append(root);
  await settle();
  return root;
}

function dispatchIntersected(sentinelEl: Element, isInView: boolean, y: number): void {
  const props: InViewProps = {
    isInView,
    entry: {
      isIntersecting: isInView,
      boundingClientRect: { y } as DOMRectReadOnly,
    } as IntersectionObserverEntry,
  };
  sentinelEl.dispatchEvent(new CustomEvent('intersected', { detail: props, bubbles: true }));
}

const BASE_SCROLL_PROPS: ScrollProps = {
  x: 0,
  y: 0,
  deltaX: 0,
  deltaY: 0,
  maxX: 0,
  maxY: 0,
  progressX: 0,
  progressY: 0,
  directionX: 0,
  directionY: 0,
  isScrolling: true,
};

describe('Sticky', () => {
  it('sizes its sentinel from the earlier instances sharing its relative ancestor', async () => {
    const root = await render(`<div style="position:relative">${sticky()}${sticky()}</div>`);
    const [first, second] = root.querySelectorAll('[data-component="Sticky"]');
    const firstInstance = getInstance<Sticky>(first, 'Sticky');
    const secondInstance = getInstance<Sticky>(second, 'Sticky');

    expect(firstInstance.sentinel?.$el.style.height).toBe('1px');
    expect((first as HTMLElement).style.top).toBe('0px');
    expect((first as HTMLElement).style.zIndex).toBe('100');

    expect(secondInstance.sentinel?.$el.style.height).toBe('51px');
    expect((second as HTMLElement).style.top).toBe('50px');
    expect((second as HTMLElement).style.zIndex).toBe('99');
  });

  it('sets `isSticky` from the sentinel entry and clears the transform once it is not sticky', async () => {
    const root = await render(sticky());
    const el = root.querySelector('[data-component="Sticky"]') as HTMLElement;
    const sentinelEl = root.querySelector('[data-component="Sentinel"]') as HTMLElement;
    const instance = getInstance<Sticky>(el, 'Sticky');
    const inner = el.querySelector('[data-ref="inner"]') as HTMLElement;

    dispatchIntersected(sentinelEl, true, -5);
    expect(instance.isSticky).toBe(true);

    dispatchIntersected(sentinelEl, false, -5);
    expect(instance.isSticky).toBe(false);
    expect(inner.style.transform).toBe('translateY(0px) translateZ(0px)');
  });

  it('does not consider a sentinel intersecting from below sticky, only one that has scrolled past the top', async () => {
    const root = await render(sticky());
    const sentinelEl = root.querySelector('[data-component="Sentinel"]') as HTMLElement;
    const el = root.querySelector('[data-component="Sticky"]') as HTMLElement;
    const instance = getInstance<Sticky>(el, 'Sticky');

    // Still fully visible, entering from below: `y` is positive.
    dispatchIntersected(sentinelEl, true, 5);
    expect(instance.isSticky).toBe(false);
  });

  it('stacks onto an earlier instance that hid itself on scroll, and unstacks once it reappears', async () => {
    const root = await render(`<div style="position:relative">${sticky()}${sticky()}</div>`);
    const [firstEl, secondEl] = [
      ...root.querySelectorAll('[data-component="Sticky"]'),
    ] as HTMLElement[];
    const [firstSentinel, secondSentinel] = [
      ...root.querySelectorAll('[data-component="Sentinel"]'),
    ] as HTMLElement[];
    const first = getInstance<Sticky>(firstEl, 'Sticky');
    const second = getInstance<Sticky>(secondEl, 'Sticky');
    const secondInner = secondEl.querySelector('[data-ref="inner"]') as HTMLElement;

    dispatchIntersected(firstSentinel, true, -5);
    dispatchIntersected(secondSentinel, true, -5);
    expect(first.isSticky).toBe(true);
    expect(second.isSticky).toBe(true);

    // `applyVisibility()` carries `@write`, so the DOM work lands in the next
    // write phase rather than synchronously — the scroll service emits from
    // the read phase, and a write from there is the gap 43 bug. `isVisible`
    // itself stays synchronous.
    first.hide();
    await settle();
    expect(firstEl.classList.contains('pointer-events-none')).toBe(true);
    expect(secondInner.style.transform).toBe('translateY(-50px) translateZ(0px)');

    first.show();
    await settle();
    expect(firstEl.classList.contains('pointer-events-none')).toBe(false);
    expect(secondInner.style.transform).toBe('translateY(0px) translateZ(0px)');
  });

  it('hides on scroll direction when `hideWhenDown` is set, and shows again on the way up', async () => {
    const root = await render(`
      <div data-component="Sticky" data-option-hide-when-down="true">
        ${SENTINEL}
        <div data-ref="inner" style="height:50px"></div>
      </div>`);
    const el = root.querySelector('[data-component="Sticky"]') as HTMLElement;
    const sentinelEl = root.querySelector('[data-component="Sentinel"]') as HTMLElement;
    const instance = getInstance<Sticky>(el, 'Sticky');

    dispatchIntersected(sentinelEl, true, -5);
    expect(instance.isSticky).toBe(true);

    instance.scrolled({ ...BASE_SCROLL_PROPS, deltaY: 10, directionY: 1 });
    expect(instance.isVisible).toBe(false);

    instance.scrolled({ ...BASE_SCROLL_PROPS, deltaY: -10, directionY: -1 });
    expect(instance.isVisible).toBe(true);
  });

  it('ignores a scroll update with no movement', async () => {
    const root = await render(sticky());
    const el = root.querySelector('[data-component="Sticky"]') as HTMLElement;
    const sentinelEl = root.querySelector('[data-component="Sentinel"]') as HTMLElement;
    const instance = getInstance<Sticky>(el, 'Sticky');

    dispatchIntersected(sentinelEl, true, -5);
    instance.scrolled({ ...BASE_SCROLL_PROPS, deltaY: 0, directionY: 0 });

    expect(instance.isVisible).toBe(true);
  });
});
