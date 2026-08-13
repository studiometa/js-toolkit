import { afterEach, describe, expect, it } from 'vitest';
import { Base } from '../Base.js';
import { registerComponent } from '../registry.js';
import { countRequestedFrames, frames, getInstance, resetDom, settle } from '../test-utils.js';
import { withDrag } from './drag.js';
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
    // Nothing left behind: the service does not know this component anymore.
    expect(instance.ticks).toBe(frozen);

    instance.$mount();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(frozen);

    // And a second mount subscribed once, not twice: the count keeps rising
    // one tick per frame.
    const before = instance.ticks;
    await frames(4);
    expect(instance.ticks - before).toBeLessThanOrEqual(5);

    instance.$terminate();
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

    // Same source, same hook: the option is what decides whether mounting is
    // enough to hear from it.
    expect(quiet).toEqual([]);
    expect(eager).toHaveLength(1);
    expect(eager[0].y).toBe(window.scrollY);

    quietInstance.$destroy();
    eagerInstance.$destroy();
  });

  it('gives each hook the props of its own service', async () => {
    const sizes: ResizeProps[] = [];

    // `{ immediate: true }` because the viewport is not going to resize during
    // this test: the resize service no longer speaks on subscribe on its own.
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

  it('subscribes nothing when the component declares no hook', () => {
    class Quiet extends withDrag(Base) {
      static config = { name: 'Quiet' };
    }

    const el = render();
    const instance = new Quiet(el).$mount();
    // No `dragged()` method, so nothing was ever added to the service: a
    // `pointerdown` starts no drag, and there is nothing to release.
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

    // The root is not the target anymore, the handle is. A press on the root
    // reaches no service — the subscription is keyed on the handle.
    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual([]);

    handle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(modes).toEqual(['start']);

    instance.$destroy();
  });

  it('stacks with another service, and takes a second target by hand', async () => {
    const scroller = render('width:100px;height:100px;overflow:auto');
    scroller.innerHTML = '<div style="width:100px;height:800px"></div>';

    // One method name per service, so a second scroller is an explicit
    // subscription whose unsubscribe joins the mount cycle's cleanups.
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
    // The window did not move, so the other subscription said nothing.
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
        // The mixin contract: hand back what is inherited along with the
        // component's own cleanup.
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
    // The subscription went with it, promise or no promise.
    const frozen = async.ticks;
    await frames(3);
    expect(async.ticks).toBe(frozen);
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
    instance.$terminate();
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
    // Released means released: the frame loop is not still calling it.
    expect(instance.ticks).toBe(whileRunning);
    expect(instance.$services.ticked.isActive).toBe(false);
    instance.$terminate();
  });

  it('genuinely stops the frame loop, not just the callback', async () => {
    const instance = new Settler(render()).$mount();
    instance.$services.ticked.start();
    await frames(2);

    instance.$services.ticked.stop();
    await frames(2);
    // Nothing else is subscribed, so the service released its tick and the
    // scheduler has no reason to ask for another frame. `frames()` awaits one
    // itself, so its own four requests are the floor: anything above them is
    // the loop still running.
    const framesRequested = await countRequestedFrames(() => frames(4));

    expect(framesRequested).toBe(4);
    instance.$terminate();
  });

  it('start() is idempotent, so one stop() is enough', async () => {
    const instance = new Settler(render()).$mount();
    instance.$services.ticked.start();
    instance.$services.ticked.start();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    // If the two calls had produced two subscriptions, one would outlive this.
    instance.$services.ticked.stop();
    const atStop = instance.ticks;
    await frames(3);

    expect(instance.ticks).toBe(atStop);
    instance.$terminate();
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
    instance.$terminate();
  });

  it('does not subscribe on a terminated instance, which nothing would release', () => {
    const instance = new Settler(render()).$mount();
    instance.$terminate();

    instance.$services.ticked.start();
    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('releases a hook started before the first mount, on terminate', () => {
    const instance = new Settler(render());
    instance.$services.ticked.start();
    expect(instance.$services.ticked.isActive).toBe(true);

    instance.$terminate();
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

    // One handle per layer, reached by the name that layer owns.
    expect(instance.ticks).toBeGreaterThan(0);
    expect(instance.$services.ticked.isActive).toBe(true);
    expect(instance.$services.scrolled.isActive).toBe(false);
    instance.$terminate();
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
