import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useScroll, useWindowScroll, type ScrollProps } from './scroll.js';

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
    const unsubscribe = useScroll().subscribe((props) => seen.push(snapshot(props)));

    window.scrollTo(0, 200);
    await settle();

    const down = seen.at(-1);
    expect(down?.y).toBe(200);
    expect(down?.deltaY).toBe(200);
    expect((down?.y ?? 0) - (down?.deltaY ?? 0)).toBe(0);
    expect(down?.deltaX).toBe(0);
    expect(down?.directionY).toBe(1);
    expect(down?.directionX).toBe(0);
    expect(down?.maxY).toBeGreaterThan(0);
    expect(down?.progressY).toBeCloseTo(200 / (down?.maxY ?? 1), 5);

    window.scrollTo(0, 50);
    await settle();

    const up = seen.at(-1);
    expect(up?.y).toBe(50);
    expect(up?.deltaY).toBe(-150);
    expect(up?.directionY).toBe(-1);

    unsubscribe();
  });

  it('reports where the page already stands when a subscriber asks', async () => {
    makePage();
    window.scrollTo(0, 150);
    await settle();

    const late: Array<ReturnType<typeof snapshot>> = [];
    const quiet = useScroll().subscribe((props) => late.push(snapshot(props)));
    expect(late).toEqual([]);

    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = useScroll().subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });

    expect(seen).toHaveLength(1);
    expect(seen[0].y).toBe(150);
    expect(seen[0].progressY).toBeCloseTo(150 / seen[0].maxY, 5);
    expect(seen[0].deltaY).toBe(0);
    expect(seen[0].directionY).toBe(0);
    expect(seen[0].isScrolling).toBe(false);

    unsubscribe();
    quiet();
  });

  it('hands out props no subscriber can write to', () => {
    const unsubscribe = useScroll().subscribe((props) => {
      // @ts-expect-error every prop field is readonly.
      props.y = 999;
    });
    unsubscribe();
  });

  it('emits once per frame however many scroll events arrive', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().subscribe(() => {
      calls += 1;
    });

    for (let i = 1; i <= 5; i += 1) {
      window.scrollTo(0, i * 20);
    }
    await settle();
    unsubscribe();

    expect(calls).toBe(1);
    expect(useScroll().props().y).toBe(100);
  });

  it('stops listening when the last subscriber leaves', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().subscribe(() => {
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
    expect(useScroll(document.documentElement)).toBe(useWindowScroll());
    expect(useScroll(document.scrollingElement as Element)).toBe(useWindowScroll());
  });
});

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
    const unsubscribe = useScroll(el).subscribe((props) => seen.push(snapshot(props)));

    el.scrollTop = 100;
    el.dispatchEvent(new Event('scroll'));
    await settle();

    const props = seen.at(-1);
    expect(props?.y).toBe(100);
    expect(props?.deltaY).toBe(100);
    expect(props?.directionY).toBe(1);
    expect(props?.maxY).toBe(700);
    expect(props?.progressY).toBeCloseTo(100 / 700, 5);

    unsubscribe();
  });

  it('re-measures its extents when the content changes', async () => {
    const el = document.createElement('div');
    el.setAttribute('style', 'width:100px;height:100px;overflow:auto');
    el.innerHTML = '<div style="width:100px;height:500px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = service.subscribe((props) => seen.push(snapshot(props)));
    await settle();
    expect(service.props().maxY).toBe(400);

    (el.firstElementChild as HTMLElement).style.height = '5000px';
    await settle();
    expect(service.props().maxY).toBe(4900);

    const added = document.createElement('div');
    added.setAttribute('style', 'width:100px;height:1000px');
    el.append(added);
    await settle();
    expect(service.props().maxY).toBe(5900);
    expect(seen.at(-1)?.maxY).toBe(5900);

    unsubscribe();
    el.remove();
  });

  it('reports no progress on an axis that cannot scroll', async () => {
    const el = document.createElement('div');
    el.setAttribute('style', 'width:100px;height:100px;overflow:auto');
    el.innerHTML = '<div style="width:100px;height:800px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const unsubscribe = service.subscribe(() => {});
    await settle();

    expect(service.props().maxX).toBe(0);
    expect(service.props().progressX).toBe(0);

    unsubscribe();
    el.remove();
  });

  it('never reports a negative extent, whatever the scrollbars cost', async () => {
    const tall = document.createElement('div');
    tall.setAttribute('style', 'height:5000px');
    document.body.append(tall);

    const service = useScroll();
    const unsubscribe = service.subscribe(() => {});
    await settle();

    const { maxX, maxY, progressX, progressY } = service.props();
    expect(maxX).toBeGreaterThanOrEqual(0);
    expect(maxY).toBeGreaterThanOrEqual(0);
    expect(Object.is(progressX, -0)).toBe(false);
    expect(progressX).toBeGreaterThanOrEqual(0);
    expect(progressY).toBeGreaterThanOrEqual(0);

    unsubscribe();
    tall.remove();
  });

  it('reports a positive progress in a right-to-left container', async () => {
    const el = document.createElement('div');
    el.setAttribute('dir', 'rtl');
    el.setAttribute('style', 'width:100px;height:100px;overflow:auto');
    el.innerHTML = '<div style="width:1000px;height:50px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const unsubscribe = service.subscribe(() => {});
    el.scrollLeft = -500;
    el.dispatchEvent(new Event('scroll'));
    await settle();

    expect(service.props().x).toBe(-500);
    expect(service.props().maxX).toBe(900);
    expect(service.props().progressX).toBeCloseTo(500 / 900, 5);

    unsubscribe();
    el.remove();
  });

  it('keeps one service per element, each with its own subscribers', async () => {
    const first = makeScroller();
    const second = makeScroller();
    expect(useScroll(first)).toBe(useScroll(first));
    expect(useScroll(first)).not.toBe(useScroll(second));
    expect(useScroll(first)).not.toBe(useScroll());

    let firstCalls = 0;
    let secondCalls = 0;
    const unsubscribeFirst = useScroll(first).subscribe(() => {
      firstCalls += 1;
    });
    const unsubscribeSecond = useScroll(second).subscribe(() => {
      secondCalls += 1;
    });

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

describe('isScrolling', () => {
  it('turns on while the target is moving', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;overflow:auto';
    el.innerHTML = '<div style="width:100px;height:1000px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const off = service.subscribe(() => {});
    el.dispatchEvent(new Event('scroll'));
    await settle();

    expect(service.props().isScrolling).toBe(true);
    off();
    el.remove();
  });

  it('turns off once the target settles, and says so', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;overflow:auto';
    el.innerHTML = '<div style="width:100px;height:1000px"></div>';
    document.body.append(el);

    const seen: boolean[] = [];
    const off = useScroll(el).subscribe(({ isScrolling }) => seen.push(isScrolling));

    el.scrollTop = 200;
    await new Promise((resolve) => setTimeout(resolve, 400));
    off();
    el.remove();

    expect(seen.length).toBeGreaterThan(0);
    expect(seen.at(-1)).toBe(false);
  });

  it('stays off when a resize refreshes the measurements', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;overflow:auto';
    el.innerHTML = '<div style="width:100px;height:1000px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const off = service.subscribe(() => {});

    window.dispatchEvent(new Event('resize'));
    await settle();

    expect(service.props().isScrolling).toBe(false);
    off();
    el.remove();
  });

  it('is false again once the service is released', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;overflow:auto';
    el.innerHTML = '<div style="width:100px;height:1000px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    const off = service.subscribe(() => {});
    el.scrollTop = 120;
    await new Promise((resolve) => setTimeout(resolve, 60));
    off();

    expect(service.props().isScrolling).toBe(false);
    el.remove();
  });
});
