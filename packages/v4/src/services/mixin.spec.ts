import { afterEach, describe, expect, it } from 'vitest';
import { Base } from '../Base.js';
import { registerComponent } from '../registry.js';
import { countRequestedFrames, frames, getInstance, resetDom, settle } from '../test-utils.js';
import { useDrag, withDrag } from './drag.js';
import { withRaf } from './raf.js';
import { withResize } from './resize.js';
import { useScroll, withScroll } from './scroll.js';
import type { DragProps } from './drag.js';
import type { RafProps } from './raf.js';
import type { ResizeProps } from './resize.js';
import type { ScrollProps } from './scroll.js';

afterEach(resetDom);

function render(style = ''): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', style);
  document.body.append(el);
  return el;
}

class Ticker extends withRaf(Base) {
  static config = { name: 'Ticker' };

  ticks = 0;
  rendered = 0;

  ticked({ delta }: RafProps) {
    this.ticks += delta >= 0 ? 1 : 0;
    return () => {
      this.rendered += 1;
    };
  }
}

describe('service mixins', () => {
  it('subscribes on mount and unsubscribes on destroy, once per cycle', async () => {
    const instance = new Ticker(render()).$mount();

    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);
    expect(instance.rendered).toBeGreaterThan(0);

    instance.$destroy();
    const frozen = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(frozen);

    instance.$mount();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(frozen);

    const before = instance.ticks;
    await frames(4);
    expect(instance.ticks - before).toBeLessThanOrEqual(5);

    instance.$destroy();
  });

  it('subscribes for a component whose `mounted()` does not chain `super`', async () => {
    class Unchained extends withRaf(Base) {
      static config = { name: 'Unchained' };

      ticks = 0;
      mountedRan = false;

      // No `super.mounted()`, which is how most components are written and
      // what used to leave the mixin subscribed to nothing.
      mounted(): void {
        this.mountedRan = true;
      }

      ticked(): void {
        this.ticks += 1;
      }
    }

    const instance = new Unchained(render()).$mount();
    await frames(3);

    expect(instance.mountedRan).toBe(true);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$destroy();
    const frozen = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(frozen);

    instance.$destroy();
  });

  it('starts the subscription once the whole `mounted()` has run', async () => {
    const order: string[] = [];

    class Ordered extends withRaf(Base) {
      static config = { name: 'Ordered' };

      mounted(): void {
        order.push(`mounted:${this.$services.ticked.isActive}`);
      }

      ticked(): void {
        if (order.at(-1) !== 'ticked') {
          order.push('ticked');
        }
      }
    }

    const instance = new Ordered(render()).$mount();
    await frames(2);

    // The component is fully set up before its first delivery, which is what
    // an `immediate` service would otherwise interrupt.
    expect(order).toEqual(['mounted:false', 'ticked']);

    instance.$destroy();
  });

  it('subscribes for a component whose `mounted()` threw, as its handlers stay bound', async () => {
    const failures: string[] = [];
    const onDiagnostic = (event: Event) => {
      // Cancel the default sink: the failure is the point of the spec, and
      // `reportError()` would surface it as an unhandled error in the run.
      event.preventDefault();
      failures.push((event as CustomEvent<{ code: string }>).detail.code);
    };
    document.addEventListener('js-toolkit:diagnostic', onDiagnostic);

    class Broken extends withRaf(Base) {
      static config = { name: 'Broken' };

      ticks = 0;
      clicks = 0;

      mounted(): void {
        throw new Error('half built');
      }

      onClick(): void {
        this.clicks += 1;
      }

      ticked(): void {
        this.ticks += 1;
      }
    }

    const el = render();
    const instance = new Broken(el).$mount();
    await frames(3);
    el.click();
    document.removeEventListener('js-toolkit:diagnostic', onDiagnostic);

    // `#guard()` reports the failure and the cycle continues: the component is
    // mounted, its handlers are bound and its option effects are live, so the
    // subscription belongs with them rather than being the one thing withheld.
    expect(failures).toContain('component.lifecycle-failed');
    expect(instance.$isMounted).toBe(true);
    expect(instance.clicks).toBe(1);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$destroy();
  });

  it('follows the registry: an element leaving the DOM leaves no subscription', async () => {
    registerComponent(Ticker);
    const el = render();
    el.setAttribute('data-component', 'Ticker');
    await settle();

    const instance = getInstance<Ticker>(el, 'Ticker');
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    el.remove();
    await settle();
    const frozen = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(frozen);
  });

  it('calls the hook with the current props when the mixin asks for them', async () => {
    const quiet: ScrollProps[] = [];
    const eager: ScrollProps[] = [];

    class Quiet extends withScroll(Base) {
      static config = { name: 'QuietHeader' };

      scrolled(props: ScrollProps): void {
        quiet.push({ ...props });
      }
    }

    class Eager extends withScroll(Base, { immediate: true }) {
      static config = { name: 'EagerHeader' };

      scrolled(props: ScrollProps): void {
        eager.push({ ...props });
      }
    }

    const quietInstance = new Quiet(render()).$mount();
    const eagerInstance = new Eager(render()).$mount();
    await settle();

    expect(quiet).toEqual([]);
    expect(eager).toHaveLength(1);
    expect(eager[0].y).toBe(window.scrollY);

    quietInstance.$destroy();
    eagerInstance.$destroy();
  });

  it('gives each hook the props of its own service', async () => {
    const sizes: ResizeProps[] = [];

    class Responsive extends withResize(Base, { immediate: true }) {
      static config = { name: 'Responsive' };

      resized(props: ResizeProps): void {
        sizes.push({ ...props });
      }
    }

    const instance = new Responsive(render()).$mount();
    await settle();

    expect(sizes.at(-1)?.width).toBe(window.innerWidth);
    expect(sizes.at(-1)?.ratio).toBe(window.innerWidth / window.innerHeight);
    instance.$destroy();
  });

  it('drags the component root element by default', () => {
    const modes: string[] = [];

    class Draggable extends withDrag(Base) {
      static config = { name: 'Draggable' };

      dragged({ mode }: DragProps): void {
        modes.push(mode);
      }
    }

    const el = render();
    const instance = new Draggable(el).$mount();

    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual(['start']);

    instance.$destroy();
    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual(['start']);
  });

  it('forwards drag axis and inertia options for the whole mount cycle', () => {
    const seen: DragProps[] = [];

    class Horizontal extends withDrag(Base, { axis: 'x', inertia: false }) {
      static config = { name: 'Horizontal' };

      dragged(props: DragProps): void {
        seen.push({ ...props });
      }
    }

    const el = render();
    const instance = new Horizontal(el).$mount();
    expect(el.style.touchAction).toBe('pan-y');

    el.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        buttons: 1,
        clientX: 10,
        clientY: 20,
        bubbles: true,
      }),
    );
    document.dispatchEvent(
      new PointerEvent('pointermove', { buttons: 1, clientX: 80, clientY: 90 }),
    );
    window.dispatchEvent(new PointerEvent('pointerup'));

    const dragged = seen.find(({ mode }) => mode === 'drag') as DragProps;
    expect(dragged.distanceX).toBe(70);
    expect(dragged.y).toBe(20);
    expect(dragged.deltaY).toBe(0);
    expect(dragged.distanceY).toBe(0);
    expect(seen.map(({ mode }) => mode)).toEqual(['start', 'drag', 'drop', 'stop']);

    instance.$destroy();
    expect(el.style.touchAction).toBe('');
  });

  it('keeps its own lifecycle options out of the service it subscribes to', () => {
    const seen: DragProps[] = [];

    class Deferred extends withDrag(Base, { manual: true }) {
      static config = { name: 'Deferred' };

      dragged(props: DragProps): void {
        seen.push(props);
      }
    }

    const el = render();
    const instance = new Deferred(el).$mount();
    instance.$services.dragged.start();

    // The service the plain `withDrag(Base)` asks for, on the same element.
    const shared = useDrag(el);
    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));

    // A service publishes its own props object, so one object is one service:
    // `manual` describes the subscription and must not buy a second drag —
    // a second pointer listener set, and a second `touch-action` claim.
    expect(seen).toHaveLength(1);
    expect(seen[0]).toBe(shared.props());

    instance.$destroy();
  });

  it('subscribes nothing when the component declares no hook', () => {
    class Quiet extends withDrag(Base) {
      static config = { name: 'Quiet' };
    }

    const el = render();
    const instance = new Quiet(el).$mount();
    expect(() => {
      el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
      instance.$destroy();
    }).not.toThrow();
  });

  it('follows another target, named per instance', () => {
    const modes: string[] = [];

    class Handled extends withDrag(Base, {
      target: (instance) => instance.$el.firstElementChild as HTMLElement,
    }) {
      static config = { name: 'Handled' };

      dragged({ mode }: DragProps): void {
        modes.push(mode);
      }
    }

    const el = render();
    el.innerHTML = '<button></button>';
    const handle = el.firstElementChild as HTMLElement;
    const instance = new Handled(el).$mount();

    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual([]);

    handle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual(['start']);

    instance.$destroy();
  });

  it('stacks with another service, and takes a second target by hand', async () => {
    const scroller = render('width:100px;height:100px;overflow:auto');
    scroller.innerHTML = '<div style="width:100px;height:800px"></div>';

    class Both extends withRaf(withScroll(Base)) {
      static config = { name: 'Both' };

      ticks = 0;
      page: number[] = [];
      inner: number[] = [];

      ticked(): void {
        this.ticks += 1;
      }

      scrolled({ y }: ScrollProps): void {
        this.page.push(y);
      }

      mounted() {
        return [
          super.mounted(),
          useScroll(this.$el).subscribe(({ y }: ScrollProps) => this.inner.push(y)),
        ];
      }
    }

    const instance = new Both(scroller).$mount();
    await frames(2);

    scroller.scrollTop = 120;
    scroller.dispatchEvent(new Event('scroll'));
    await settle();

    expect(instance.ticks).toBeGreaterThan(0);
    expect(instance.inner).toEqual([120]);
    expect(instance.page).toEqual([]);

    instance.$destroy();
    scroller.scrollTop = 240;
    scroller.dispatchEvent(new Event('scroll'));
    await settle();
    expect(instance.inner).toEqual([120]);
  });

  it('keeps whatever the component returned from mounted(), sync or async', async () => {
    const calls: string[] = [];

    class SyncCleanup extends withRaf(Base) {
      static config = { name: 'SyncCleanup' };

      ticked(): void {
        calls.push('ticked');
      }

      mounted() {
        calls.push('mounted');
        return [super.mounted(), () => calls.push('cleanup')];
      }
    }

    class AsyncCleanup extends withRaf(Base) {
      static config = { name: 'AsyncCleanup' };

      ticks = 0;

      ticked(): void {
        this.ticks += 1;
      }

      async mounted() {
        const inherited = super.mounted();
        await Promise.resolve();
        calls.push('async mounted');
        return [inherited, () => calls.push('async cleanup')];
      }
    }

    const sync = new SyncCleanup(render()).$mount();
    await frames(3);
    expect(calls).toContain('mounted');
    expect(calls).toContain('ticked');

    sync.$destroy();
    expect(calls).toContain('cleanup');
    const ticked = calls.filter((call) => call === 'ticked').length;
    await frames(3);
    expect(calls.filter((call) => call === 'ticked')).toHaveLength(ticked);

    const async = new AsyncCleanup(render()).$mount();
    await frames(3);
    expect(calls).toContain('async mounted');
    expect(async.ticks).toBeGreaterThan(0);

    async.$destroy();
    await settle();
    expect(calls).toContain('async cleanup');
    const frozen = async.ticks;
    await frames(3);
    expect(async.ticks).toBe(frozen);
  });
});

describe('a resolver which comes back with nothing', () => {
  it('reports it and starts no subscription, rather than observing a default', async () => {
    const codes: string[] = [];
    const onDiagnostic = (event: Event) => {
      event.preventDefault();
      codes.push((event as CustomEvent<{ code: string }>).detail.code);
    };
    document.addEventListener('js-toolkit:diagnostic', onDiagnostic);

    class Renamed extends Base {
      static config = { name: 'RenamedTarget' };
      calls = 0;
      resized(): void {
        this.calls += 1;
      }
    }
    // What a stale assertion looks like: the ref it named is gone.
    const Mixed = withResize(Renamed, {
      target: (instance) => (instance as unknown as { gone: HTMLElement }).gone,
      immediate: true,
    });

    const instance = new Mixed(render()).$mount();
    await settle();
    document.removeEventListener('js-toolkit:diagnostic', onDiagnostic);

    expect(codes).toEqual(['service.missing-target']);
    // `useResize()` defaults its target to the document element, so without
    // this the component would have observed the page and looked fine.
    expect(instance.calls).toBe(0);
    // One subscription is missing, not the mount cycle.
    expect(instance.$isMounted).toBe(true);
    // Nothing subscribed, so the handle must say so too.
    expect(instance.$services.resized.isActive).toBe(false);

    instance.$destroy();
  });

  it('leaves a service whose own target is nothing alone', () => {
    const codes: string[] = [];
    const onDiagnostic = (event: Event) => {
      event.preventDefault();
      codes.push((event as CustomEvent<{ code: string }>).detail.code);
    };
    document.addEventListener('js-toolkit:diagnostic', onDiagnostic);

    // `withRaf` resolves no target by design, and that is the contract rather
    // than a mistake — only a caller's resolver can be wrong.
    // No settle: `Ticker` is registered by an earlier spec, and the registry
    // destroys an instance whose element carries no matching token — which is
    // correct, and would take this instance with it.
    const instance = new Ticker(render()).$mount();
    document.removeEventListener('js-toolkit:diagnostic', onDiagnostic);

    expect(codes).toEqual([]);
    // It subscribed: this service observes nothing by design, which is the
    // contract rather than a mistake.
    expect(instance.$services.ticked.isActive).toBe(true);

    instance.$destroy();
  });
});

describe('a manual hook', () => {
  class Settler extends withRaf(Base, { manual: true }) {
    static config = { name: 'Settler' };

    ticks = 0;

    ticked() {
      this.ticks += 1;
    }
  }

  it('is declared but not subscribed by mounting', async () => {
    const instance = new Settler(render()).$mount();
    await frames(3);

    expect(instance.ticks).toBe(0);
    expect(instance.$services.ticked.isActive).toBe(false);
    instance.$destroy();
  });

  it('runs while the component wants it, and not after', async () => {
    const instance = new Settler(render()).$mount();

    instance.$services.ticked.start();
    expect(instance.$services.ticked.isActive).toBe(true);
    await frames(3);
    const whileRunning = instance.ticks;
    expect(whileRunning).toBeGreaterThan(0);

    instance.$services.ticked.stop();
    await frames(3);
    expect(instance.ticks).toBe(whileRunning);
    expect(instance.$services.ticked.isActive).toBe(false);
    instance.$destroy();
  });

  it('genuinely stops the frame loop, not just the callback', async () => {
    const instance = new Settler(render()).$mount();
    instance.$services.ticked.start();
    await frames(2);

    instance.$services.ticked.stop();
    await frames(2);
    const framesRequested = await countRequestedFrames(() => frames(4));

    expect(framesRequested).toBe(4);
    instance.$destroy();
  });

  it('start() is idempotent, so one stop() is enough', async () => {
    const instance = new Settler(render()).$mount();
    instance.$services.ticked.start();
    instance.$services.ticked.start();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$services.ticked.stop();
    const atStop = instance.ticks;
    await frames(3);

    expect(instance.ticks).toBe(atStop);
    instance.$destroy();
  });

  it('is released by the mount cycle whichever side started it', async () => {
    const instance = new Settler(render()).$mount();
    instance.$services.ticked.start();
    await frames(2);

    instance.$destroy();
    expect(instance.$services.ticked.isActive).toBe(false);
    const atDestroy = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(atDestroy);
    instance.$destroy();
  });

  it('releases a hook started before the first mount, on destroy', () => {
    const instance = new Settler(render());
    instance.$services.ticked.start();
    expect(instance.$services.ticked.isActive).toBe(true);

    instance.$destroy();
    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('gives each stacked layer its own handle, under its own name', async () => {
    class Both extends withScroll(withRaf(Base, { manual: true }), { manual: true }) {
      static config = { name: 'Both' };

      ticks = 0;
      scrolls = 0;

      ticked() {
        this.ticks += 1;
      }

      scrolled() {
        this.scrolls += 1;
      }
    }

    const instance = new Both(render()).$mount();
    instance.$services.ticked.start();
    await frames(3);

    expect(instance.ticks).toBeGreaterThan(0);
    expect(instance.$services.ticked.isActive).toBe(true);
    expect(instance.$services.scrolled.isActive).toBe(false);
    instance.$destroy();
  });
});

describe('service decorators', () => {
  it('is the mixin with a build step', async () => {
    @withRaf()
    class Decorated extends Base {
      static config = { name: 'Decorated' };

      ticks = 0;

      ticked(): void {
        this.ticks += 1;
      }
    }

    const instance = new Decorated(render()).$mount();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$destroy();
    const frozen = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(frozen);
  });

  it('carries its options, and stacks like the mixin', async () => {
    const el = render('width:100px;height:100px;overflow:auto');
    el.innerHTML = '<div style="width:100px;height:800px"></div>';

    @withScroll({ target: (instance) => instance.$el })
    @withRaf()
    class Decorated extends Base {
      static config = { name: 'DecoratedScroll' };

      ticks = 0;
      inner: number[] = [];

      ticked(): void {
        this.ticks += 1;
      }

      scrolled({ y }: ScrollProps): void {
        this.inner.push(y);
      }
    }

    const instance = new Decorated(el).$mount();
    el.scrollTop = 60;
    el.dispatchEvent(new Event('scroll'));
    await frames(2);
    await settle();

    expect(instance.inner).toEqual([60]);
    expect(instance.ticks).toBeGreaterThan(0);
    instance.$destroy();
  });
});
