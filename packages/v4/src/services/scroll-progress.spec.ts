import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { Base } from '../Base.js';
import { settle } from '../test-utils.js';
import type { Toggle } from './toggle.js';
import {
  useScrollProgress,
  withScrollProgress,
  type ScrollProgressProps,
  type ScrollProgressRender,
} from './scroll-progress.js';

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

describe('withScrollProgress', () => {
  it('uses the component root and delivers its initial progress by default', () => {
    const seen: ScrollProgressProps[] = [];

    class Hero extends withScrollProgress(Base, { offset: 'start center / end center' }) {
      static config = { name: 'RootProgressHero' };

      scrolledInView(props: ScrollProgressProps): void {
        seen.push(snapshot(props));
      }
    }

    const target = makeTarget();
    const instance = new Hero(target).$mount();

    expect(seen).toHaveLength(1);
    expect(seen[0].startY).toBe(800 - window.innerHeight / 2);
    expect(seen[0].endY).toBe(900 - window.innerHeight / 2);
    instance.$terminate();
  });

  it('supports a per-instance target and keeps generic fields out of the service key', () => {
    const target = makeTarget();
    const original = target.getBoundingClientRect.bind(target);
    let layoutReads = 0;
    target.getBoundingClientRect = () => {
      layoutReads += 1;
      return original();
    };
    const quiet: ScrollProgressProps[] = [];
    const eager: ScrollProgressProps[] = [];

    class Quiet extends withScrollProgress(Base, {
      target: () => target,
      offset: 'center center / end start',
      immediate: false,
    }) {
      static config = { name: 'QuietProgressTarget' };

      scrolledInView(props: ScrollProgressProps): void {
        quiet.push(snapshot(props));
      }
    }

    class Eager extends withScrollProgress(Base, {
      target: () => target,
      offset: 'center center / end start',
      immediate: true,
      manual: false,
    }) {
      static config = { name: 'EagerProgressTarget' };

      scrolledInView(props: ScrollProgressProps): void {
        eager.push(snapshot(props));
      }
    }

    const quietRoot = document.body.appendChild(document.createElement('div'));
    const eagerRoot = document.body.appendChild(document.createElement('div'));
    const quietInstance = new Quiet(quietRoot).$mount();
    const eagerInstance = new Eager(eagerRoot).$mount();

    expect(layoutReads).toBe(1);
    expect(quiet).toEqual([]);
    expect(eager).toHaveLength(1);
    expect(eager[0].startY).toBe(850 - window.innerHeight / 2);
    expect(eager[0].endY).toBe(900);
    quietInstance.$terminate();
    eagerInstance.$terminate();
  });

  it('supports the stage-3 decorator form', () => {
    const seen: ScrollProgressProps[] = [];

    @withScrollProgress({ offset: 'start center / end center' })
    class DecoratedHero extends Base {
      static config = { name: 'DecoratedProgressHero' };

      scrolledInView(props: ScrollProgressProps): void {
        seen.push(snapshot(props));
      }
    }

    const target = makeTarget();
    const instance = new DecoratedHero(target).$mount();

    expect(seen).toHaveLength(1);
    expect(seen[0].startX).toBe(900 - window.innerWidth / 2);
    expect(seen[0].endX).toBe(1100 - window.innerWidth / 2);
    instance.$terminate();
  });

  it('honours explicit immediate false', async () => {
    const seen: ScrollProgressProps[] = [];

    class Deferred extends withScrollProgress(Base, { immediate: false }) {
      static config = { name: 'DeferredProgressHero' };

      scrolledInView(props: ScrollProgressProps): void {
        seen.push(snapshot(props));
      }
    }

    const instance = new Deferred(makeTarget()).$mount();
    expect(seen).toEqual([]);

    window.scrollTo(0, 100);
    window.dispatchEvent(new Event('scroll'));
    await settle();
    expect(seen).toHaveLength(1);
    instance.$terminate();
  });

  it('defers returned renders through $write and cancels a stale mount-cycle write', async () => {
    class Renderer extends withScrollProgress(Base) {
      static config = { name: 'ProgressRenderer' };

      measurements = 0;
      renders = 0;
      writes = 0;

      scrolledInView(): ScrollProgressRender {
        this.measurements += 1;
        return () => {
          this.renders += 1;
        };
      }

      $write<T>(fn: () => T) {
        this.writes += 1;
        return super.$write(fn);
      }
    }

    const live = new Renderer(makeTarget()).$mount();
    expect(live.measurements).toBe(1);
    expect(live.writes).toBe(1);
    expect(live.renders).toBe(0);
    await settle();
    expect(live.renders).toBe(1);
    live.$terminate();

    const stale = new Renderer(makeTarget()).$mount();
    expect(stale.measurements).toBe(1);
    expect(stale.writes).toBe(1);
    expect(stale.renders).toBe(0);
    stale.$destroy();
    await settle();
    expect(stale.renders).toBe(0);
    stale.$terminate();
  });

  it('cleans up automatically and subscribes once on each remount', async () => {
    class Remounted extends withScrollProgress(Base) {
      static config = { name: 'RemountedProgressHero' };

      calls = 0;

      scrolledInView(): void {
        this.calls += 1;
      }
    }

    const target = makeTarget();
    const instance = new Remounted(target).$mount();
    expect(instance.calls).toBe(1);

    instance.$destroy();
    target.style.top = '1200px';
    window.scrollTo(0, 200);
    await settle();
    expect(instance.calls).toBe(1);

    instance.$mount();
    expect(instance.calls).toBe(2);
    target.style.top = '1400px';
    await settle();
    expect(instance.calls).toBe(3);
    instance.$terminate();
  });

  it('exposes a manual typed handle and releases it on stop and termination', async () => {
    class Manual extends withScrollProgress(Base, { manual: true }) {
      static config = { name: 'ManualProgressHero' };

      calls = 0;

      scrolledInView(): void {
        this.calls += 1;
      }
    }

    const instance = new Manual(makeTarget()).$mount();
    expect(instance.calls).toBe(0);
    expect(instance.$services.scrolledInView.isActive).toBe(false);

    instance.$services.scrolledInView.start();
    expect(instance.calls).toBe(1);
    expect(instance.$services.scrolledInView.isActive).toBe(true);
    instance.$services.scrolledInView.stop();
    window.scrollTo(0, 100);
    await settle();
    expect(instance.calls).toBe(1);

    instance.$services.scrolledInView.start();
    expect(instance.$services.scrolledInView.isActive).toBe(true);
    instance.$terminate();
    expect(instance.$services.scrolledInView.isActive).toBe(false);
  });

  it('types the hook, returned render and manual service handle', () => {
    class Typed extends withScrollProgress(Base, { manual: true }) {
      static config = { name: 'TypedProgressHero' };

      scrolledInView(props: ScrollProgressProps): void | ScrollProgressRender {
        expectTypeOf(props).toEqualTypeOf<ScrollProgressProps>();
        expectTypeOf(this.$services.scrolledInView).toEqualTypeOf<Toggle>();
        const render: ScrollProgressRender = () => {};
        expectTypeOf(render).toEqualTypeOf<ScrollProgressRender>();
        return render;
      }
    }

    expectTypeOf<Typed['scrolledInView']>().returns.toEqualTypeOf<void | ScrollProgressRender>();
  });
});
