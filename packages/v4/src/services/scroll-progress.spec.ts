import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useScrollProgress, type ScrollProgressProps } from './scroll-progress.js';

function snapshot(props: ScrollProgressProps): ScrollProgressProps {
  return { ...props };
}

function makeTarget(): HTMLElement {
  const page = document.createElement('div');
  page.style.cssText = 'position:relative;width:3000px;height:3000px';
  const target = document.createElement('div');
  target.style.cssText = 'position:absolute;left:900px;top:800px;width:200px;height:100px';
  page.append(target);
  document.body.append(page);
  return target;
}

afterEach(async () => {
  document.body.innerHTML = '';
  window.scrollTo(0, 0);
  await settle();
});

describe('useScrollProgress', () => {
  it('uses element-entering to element-leaving as its default edges', () => {
    const target = makeTarget();
    const seen: ScrollProgressProps[] = [];
    const unsubscribe = useScrollProgress(target).subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });

    expect(seen).toHaveLength(1);
    expect(seen[0].startX).toBe(900 - window.innerWidth);
    expect(seen[0].endX).toBe(1100);
    expect(seen[0].startY).toBe(800 - window.innerHeight);
    expect(seen[0].endY).toBe(900);
    unsubscribe();
  });

  it('supports custom edge pairs on both axes', () => {
    const target = makeTarget();
    const seen: ScrollProgressProps[] = [];
    const unsubscribe = useScrollProgress(target, {
      offset: 'center center / end start',
    }).subscribe((props) => seen.push(snapshot(props)), { immediate: true });

    expect(seen[0].startX).toBe(1000 - window.innerWidth / 2);
    expect(seen[0].endX).toBe(1100);
    expect(seen[0].startY).toBe(850 - window.innerHeight / 2);
    expect(seen[0].endY).toBe(900);
    unsubscribe();
  });

  it('updates both axes from the shared window scroll without another layout read', async () => {
    const target = makeTarget();
    const original = target.getBoundingClientRect.bind(target);
    let layoutReads = 0;
    target.getBoundingClientRect = () => {
      layoutReads += 1;
      return original();
    };
    const service = useScrollProgress(target);
    const unsubscribe = service.subscribe(() => {}, { immediate: true });
    // Let the observer's initial box delivery finish, then count from the
    // stable running state. Scroll updates must not read the target again.
    await settle();
    const readsBeforeScroll = layoutReads;

    window.scrollTo(500, 400);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    await settle();

    const props = service.props();
    expect(props.currentX).toBe(500);
    expect(props.currentY).toBe(400);
    expect(props.progressX).toBeCloseTo((500 - props.startX) / (props.endX - props.startX), 5);
    expect(props.progressY).toBeCloseTo((400 - props.startY) / (props.endY - props.startY), 5);
    expect(layoutReads).toBe(readsBeforeScroll);
    unsubscribe();
  });

  it('clamps current positions and progress at both ends', async () => {
    const target = makeTarget();
    const service = useScrollProgress(target, { offset: 'start start / end start' });
    const unsubscribe = service.subscribe(() => {}, { immediate: true });

    expect(service.props().currentX).toBe(900);
    expect(service.props().currentY).toBe(800);
    expect(service.props().progressX).toBe(0);
    expect(service.props().progressY).toBe(0);

    window.scrollTo(1600, 1600);
    await settle();
    expect(service.props().currentX).toBe(1100);
    expect(service.props().currentY).toBe(900);
    expect(service.props().progressX).toBe(1);
    expect(service.props().progressY).toBe(1);
    unsubscribe();
  });

  it('reports zero progress for a zero-length range', () => {
    const target = makeTarget();
    const service = useScrollProgress(target, { offset: 'start start / start start' });
    const unsubscribe = service.subscribe(() => {}, { immediate: true });
    const props = service.props();

    expect(props.startX).toBe(props.endX);
    expect(props.startY).toBe(props.endY);
    expect(props.currentX).toBe(props.startX);
    expect(props.currentY).toBe(props.startY);
    expect(props.progressX).toBe(0);
    expect(props.progressY).toBe(0);
    expect(Number.isFinite(props.progressX)).toBe(true);
    expect(Number.isFinite(props.progressY)).toBe(true);
    unsubscribe();
  });

  it('delivers a current measurement only when immediate is requested', () => {
    const target = makeTarget();
    const service = useScrollProgress(target);
    const quiet: ScrollProgressProps[] = [];
    const first = service.subscribe((props) => quiet.push(snapshot(props)));
    expect(quiet).toEqual([]);

    const seen: ScrollProgressProps[] = [];
    const second = service.subscribe((props) => seen.push(snapshot(props)), { immediate: true });
    expect(seen).toHaveLength(1);
    expect(seen[0].endX).toBe(1100);
    expect(seen[0].endY).toBe(900);
    expect(quiet).toEqual([]);
    first();
    second();
  });

  it('shares matching target and options, and separates different options', async () => {
    const target = makeTarget();
    expect(useScrollProgress(target)).toBe(useScrollProgress(target, {}));
    expect(useScrollProgress(target)).toBe(
      useScrollProgress(target, { offset: 'start end / end start' }),
    );
    expect(useScrollProgress(target)).not.toBe(
      useScrollProgress(target, { offset: 'start start / end end' }),
    );

    let firstCalls = 0;
    let secondCalls = 0;
    const service = useScrollProgress(target);
    const first = service.subscribe(() => {
      firstCalls += 1;
    });
    const second = service.subscribe(() => {
      secondCalls += 1;
    });
    first();
    window.scrollTo(100, 100);
    await settle();
    expect(firstCalls).toBe(0);
    expect(secondCalls).toBe(1);
    second();
  });

  it('re-measures on viewport resize', async () => {
    const target = makeTarget();
    const original = target.getBoundingClientRect.bind(target);
    let layoutReads = 0;
    target.getBoundingClientRect = () => {
      layoutReads += 1;
      return original();
    };
    const unsubscribe = useScrollProgress(target).subscribe(() => {});
    await settle();
    const beforeResize = layoutReads;

    window.dispatchEvent(new Event('resize'));
    await settle();

    expect(layoutReads).toBeGreaterThan(beforeResize);
    unsubscribe();
  });

  it('re-measures when target geometry changes', async () => {
    const target = makeTarget();
    const seen: ScrollProgressProps[] = [];
    const service = useScrollProgress(target);
    const unsubscribe = service.subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });
    const before = snapshot(service.props());

    target.style.top = '1000px';
    target.style.width = '300px';
    await settle();

    expect(service.props().startY).toBe(before.startY + 200);
    expect(service.props().endY).toBe(before.endY + 200);
    expect(service.props().endX).toBe(before.endX + 100);
    expect(seen.at(-1)?.endX).toBe(service.props().endX);
    unsubscribe();
  });

  it('releases observers, shared subscriptions and scheduled measurements', async () => {
    const target = makeTarget();
    const original = target.getBoundingClientRect.bind(target);
    let layoutReads = 0;
    target.getBoundingClientRect = () => {
      layoutReads += 1;
      return original();
    };
    let calls = 0;
    const service = useScrollProgress(target);
    const unsubscribe = service.subscribe(
      () => {
        calls += 1;
      },
      { immediate: true },
    );
    const frozen = snapshot(service.props());
    expect(layoutReads).toBe(1);

    target.style.top = '1200px';
    unsubscribe();
    window.scrollTo(600, 600);
    await settle();

    expect(calls).toBe(1);
    expect(layoutReads).toBe(1);
    expect(service.props()).toEqual(frozen);
  });

  it('keeps props current only while running and re-measures on restart', async () => {
    const target = makeTarget();
    const service = useScrollProgress(target);
    expect(service.props()).toEqual({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      currentX: 0,
      currentY: 0,
      progressX: 0,
      progressY: 0,
    });

    const first = service.subscribe(() => {}, { immediate: true });
    first();
    const stale = snapshot(service.props());
    target.style.left = '1200px';
    await settle();
    expect(service.props()).toEqual(stale);

    const seen: ScrollProgressProps[] = [];
    const second = service.subscribe((props) => seen.push(snapshot(props)), { immediate: true });
    expect(seen[0].endX).toBe(1400);
    second();
  });

  it('hands out readonly props', () => {
    const target = makeTarget();
    const unsubscribe = useScrollProgress(target).subscribe((props) => {
      // @ts-expect-error service props are shared and readonly.
      props.progressY = 1;
    });
    unsubscribe();
  });
});
