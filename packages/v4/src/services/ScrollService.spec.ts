import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useScroll, useWindowScroll, type ScrollProps } from './ScrollService.js';

/**
 * The props object is mutated in place, so every emission has to be read at
 * once rather than kept as a reference.
 */
function snapshot(props: ScrollProps) {
  return { ...props };
}

function makePage(): void {
  const spacer = document.createElement('div');
  spacer.setAttribute('style', 'height:300vh');
  document.body.append(spacer);
}

afterEach(() => {
  document.body.innerHTML = '';
  window.scrollTo(0, 0);
});

describe('useScroll', () => {
  it('reports the position, its delta, its progress and where it is going', async () => {
    makePage();
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = useScroll().add((props) => seen.push(snapshot(props)));

    window.scrollTo(0, 200);
    await settle();

    const down = seen.at(-1);
    expect(down?.y).toBe(200);
    expect(down?.lastY).toBe(0);
    expect(down?.deltaY).toBe(200);
    expect(down?.changedY).toBe(true);
    expect(down?.changedX).toBe(false);
    expect(down?.isDown).toBe(true);
    expect(down?.isUp).toBe(false);
    expect(down?.maxY).toBeGreaterThan(0);
    expect(down?.progressY).toBeCloseTo(200 / (down?.maxY ?? 1), 5);

    window.scrollTo(0, 50);
    await settle();

    const up = seen.at(-1);
    expect(up?.y).toBe(50);
    expect(up?.deltaY).toBe(-150);
    expect(up?.isUp).toBe(true);
    expect(up?.isDown).toBe(false);

    unsubscribe();
  });

  it('emits once per frame however many scroll events arrive', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().add(() => {
      calls += 1;
    });

    for (let i = 1; i <= 5; i += 1) {
      window.scrollTo(0, i * 20);
    }
    await settle();
    unsubscribe();

    // Five positions, one measurement — and it reports the last one.
    expect(calls).toBe(1);
    expect(useScroll().props().y).toBe(100);
  });

  it('stops listening when the last subscriber leaves', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().add(() => {
      calls += 1;
    });

    window.scrollTo(0, 120);
    await settle();
    expect(calls).toBe(1);

    unsubscribe();
    window.scrollTo(0, 240);
    await settle();
    expect(calls).toBe(1);
  });

  it('is the window service when no target is given', () => {
    expect(useScroll()).toBe(useWindowScroll());
    expect(useScroll(window)).toBe(useWindowScroll());
  });
});

/**
 * An element with an overflow, which is what most of the ecosystem scopes
 * its scroll primitive to — VueUse's `useScroll(el)`, solid-primitives'
 * `createScrollPosition(el)`.
 */
function makeScroller(): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', 'width:100px;height:100px;overflow:auto');
  el.innerHTML = '<div style="width:400px;height:800px"></div>';
  document.body.append(el);
  return el;
}

describe('useScroll(element)', () => {
  it('reports the element scroll rather than the page one', async () => {
    const el = makeScroller();
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = useScroll(el).add((props) => seen.push(snapshot(props)));

    el.scrollTop = 100;
    el.dispatchEvent(new Event('scroll'));
    await settle();

    const props = seen.at(-1);
    expect(props?.y).toBe(100);
    expect(props?.deltaY).toBe(100);
    expect(props?.isDown).toBe(true);
    // 800px of content in a 100px box.
    expect(props?.maxY).toBe(700);
    expect(props?.progressY).toBeCloseTo(100 / 700, 5);

    unsubscribe();
  });

  it('keeps one service per element, each with its own subscribers', async () => {
    const first = makeScroller();
    const second = makeScroller();
    expect(useScroll(first)).toBe(useScroll(first));
    expect(useScroll(first)).not.toBe(useScroll(second));
    expect(useScroll(first)).not.toBe(useScroll());

    let firstCalls = 0;
    let secondCalls = 0;
    const unsubscribeFirst = useScroll(first).add(() => {
      firstCalls += 1;
    });
    const unsubscribeSecond = useScroll(second).add(() => {
      secondCalls += 1;
    });

    // The last subscriber of one element leaves; the other element is
    // untouched and keeps reporting.
    unsubscribeFirst();
    first.scrollTop = 50;
    first.dispatchEvent(new Event('scroll'));
    second.scrollTop = 50;
    second.dispatchEvent(new Event('scroll'));
    await settle();

    expect(firstCalls).toBe(0);
    expect(secondCalls).toBe(1);
    unsubscribeSecond();
  });
});
