import { afterEach, describe, expect, it } from 'vitest';
import { Base } from '../Base.js';
import { registerComponent } from '../registry.js';
import { frames, getInstance, resetDom, settle } from '../test-utils.js';
import { withDrag } from './DragService.js';
import { withRaf } from './RafService.js';
import { withResize } from './ResizeService.js';
import { withScroll } from './ScrollService.js';
import type { DragProps } from './DragService.js';
import type { RafProps } from './RafService.js';
import type { ResizeProps } from './ResizeService.js';
import type { ScrollProps } from './ScrollService.js';

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

  it('gives each hook the props of its own service', async () => {
    const sizes: ResizeProps[] = [];

    class Responsive extends withResize(Base) {
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

      dragged({ mode, target }: DragProps): void {
        modes.push(mode);
        expect(target).toBe(this.$el);
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
    const targets: HTMLElement[] = [];

    class Handled extends withDrag(Base, {
      target: (instance) => instance.$el.firstElementChild as HTMLElement,
    }) {
      static config = { name: 'Handled' };

      dragged({ target }: DragProps): void {
        targets.push(target);
      }
    }

    const el = render();
    el.innerHTML = '<button></button>';
    const handle = el.firstElementChild as HTMLElement;
    const instance = new Handled(el).$mount();

    // The root is not the target anymore, the handle is.
    el.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(targets).toEqual([]);

    handle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, buttons: 1, bubbles: true }));
    expect(targets).toEqual([handle]);

    instance.$destroy();
  });

  it('stacks: two subscriptions of the same kind, two targets, two methods', async () => {
    const scroller = render('width:100px;height:100px;overflow:auto');
    scroller.innerHTML = '<div style="width:100px;height:800px"></div>';

    class Both extends withScroll(
      withScroll(Base, {
        hook: 'innerScrolled',
        target: (instance) => instance.$el,
      }),
    ) {
      static config = { name: 'Both' };

      page: number[] = [];
      inner: number[] = [];

      scrolled({ y }: ScrollProps): void {
        this.page.push(y);
      }

      innerScrolled({ y }: ScrollProps): void {
        this.inner.push(y);
      }
    }

    const instance = new Both(scroller).$mount();

    scroller.scrollTop = 120;
    scroller.dispatchEvent(new Event('scroll'));
    await settle();

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

describe('manual subscriptions', () => {
  class ManualTicker extends withRaf(Base, { manual: true }) {
    static config = { name: 'ManualTicker' };

    ticks = 0;

    ticked(): void {
      this.ticks += 1;
    }
  }

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  it('declares the hook without subscribing it, until $enable', async () => {
    const instance = new ManualTicker(render()).$mount();

    await frames(3);
    // Declared, not subscribed: `mounted()` left it off.
    expect(instance.ticks).toBe(0);

    instance.$enable('ticked');
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    const frozen = instance.ticks;
    instance.$disable('ticked');
    await frames(3);
    expect(instance.ticks).toBe(frozen);

    // And it resumes within the same mount cycle.
    instance.$enable('ticked');
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(frozen);

    instance.$terminate();
  });

  it('cannot subscribe twice, whatever the number of $enable calls', async () => {
    const instance = new ManualTicker(render()).$mount();

    instance.$enable('ticked');
    instance.$enable('ticked');
    instance.$enable('ticked');

    await frames(4);
    const counted = instance.ticks;
    // One subscription means at most one tick per frame — three would treble
    // the count.
    expect(counted).toBeGreaterThan(0);
    expect(counted).toBeLessThanOrEqual(6);

    // One `$disable` is enough to release it.
    instance.$disable('ticked');
    await frames(3);
    expect(instance.ticks).toBe(counted);

    instance.$terminate();
  });

  it('is safe before mount and after destroy, and releases on destroy', async () => {
    const instance = new ManualTicker(render());

    expect(() => instance.$enable('ticked')).not.toThrow();
    await frames(2);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$mount();
    instance.$destroy();
    const frozen = instance.ticks;
    await frames(3);
    // Everything is released on destroy, manual or not.
    expect(instance.ticks).toBe(frozen);

    expect(() => {
      instance.$disable('ticked');
      instance.$enable('ticked');
      instance.$disable('ticked');
    }).not.toThrow();

    instance.$terminate();
    const afterTerminate = instance.ticks;
    // A terminated instance never mounts again, so nothing would release a
    // new subscription: `$enable` is a no-op rather than a leak.
    expect(() => instance.$enable('ticked')).not.toThrow();
    await frames(3);
    expect(instance.ticks).toBe(afterTerminate);
  });

  it('stops the frame loop when nothing else needs it', async () => {
    await settle();
    const original = globalThis.requestAnimationFrame;
    let calls = 0;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      calls += 1;
      return original.call(globalThis, callback);
    }) as typeof requestAnimationFrame;

    try {
      const instance = new ManualTicker(render()).$mount();
      await sleep(100);
      // Nothing subscribed, nothing queued: no frame was ever requested.
      expect(calls).toBe(0);

      instance.$enable('ticked');
      await sleep(100);
      expect(calls).toBeGreaterThan(2);
      expect(instance.ticks).toBeGreaterThan(0);

      instance.$disable('ticked');
      // Let the frame already requested run out.
      await sleep(50);
      const stopped = calls;
      const ticks = instance.ticks;

      await sleep(150);
      // The rAF loop is genuinely gone, not merely quiet.
      expect(calls).toBe(stopped);
      expect(instance.ticks).toBe(ticks);

      instance.$terminate();
    } finally {
      globalThis.requestAnimationFrame = original;
    }
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

    @withScroll({ hook: 'innerScrolled', target: (instance) => instance.$el })
    @withRaf()
    class Decorated extends Base {
      static config = { name: 'DecoratedScroll' };

      ticks = 0;
      inner: number[] = [];

      ticked(): void {
        this.ticks += 1;
      }

      innerScrolled({ y }: ScrollProps): void {
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
