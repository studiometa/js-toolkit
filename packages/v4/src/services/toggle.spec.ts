import { afterEach, describe, expect, it } from 'vitest';
import { Base } from '../Base.js';
import { frames, resetDom } from '../test-utils.js';
import { useRaf } from './raf.js';
import { toggle } from './toggle.js';
import type { MountedReturn } from '../Base.js';

afterEach(resetDom);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function render(): HTMLElement {
  const el = document.createElement('div');
  document.body.append(el);
  return el;
}

/**
 * A component that needs the frame loop only while something settles — the
 * case a mount cycle is the wrong span for.
 */
class Settler extends Base {
  static config = { name: 'Settler' };

  ticks = 0;

  frame = toggle(() =>
    useRaf().subscribe(() => {
      this.ticks += 1;
    }),
  );

  mounted(): MountedReturn {
    // `stop` is bound, so it is a cleanup as it stands.
    return this.frame.stop;
  }
}

describe('toggle', () => {
  it('subscribes nothing until it is started', async () => {
    const instance = new Settler(render()).$mount();

    await frames(3);
    expect(instance.frame.isActive).toBe(false);
    expect(instance.ticks).toBe(0);

    instance.frame.start();
    expect(instance.frame.isActive).toBe(true);
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(0);

    const frozen = instance.ticks;
    instance.frame.stop();
    expect(instance.frame.isActive).toBe(false);
    await frames(3);
    expect(instance.ticks).toBe(frozen);

    // And it resumes within the same mount cycle.
    instance.frame.start();
    await frames(3);
    expect(instance.ticks).toBeGreaterThan(frozen);

    instance.$terminate();
  });

  it('cannot subscribe twice, whatever the number of starts', async () => {
    const instance = new Settler(render()).$mount();

    instance.frame.start();
    instance.frame.start();
    instance.frame.start();

    await frames(4);
    const counted = instance.ticks;
    // One subscription means at most one tick per frame — three would treble
    // the count.
    expect(counted).toBeGreaterThan(0);
    expect(counted).toBeLessThanOrEqual(6);

    // And one stop is enough to release it, however many times it is called.
    instance.frame.stop();
    instance.frame.stop();
    await frames(3);
    expect(instance.ticks).toBe(counted);

    instance.$terminate();
  });

  it('is released with the mount cycle when mounted() hands back its stop', async () => {
    const instance = new Settler(render()).$mount();
    instance.frame.start();
    await frames(2);
    expect(instance.ticks).toBeGreaterThan(0);

    instance.$destroy();
    expect(instance.frame.isActive).toBe(false);
    const frozen = instance.ticks;
    await frames(3);
    expect(instance.ticks).toBe(frozen);

    instance.$terminate();
  });

  it('stops the frame loop when nothing else needs it', async () => {
    const original = globalThis.requestAnimationFrame;
    let calls = 0;
    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      calls += 1;
      return original.call(globalThis, callback);
    }) as typeof requestAnimationFrame;

    try {
      const instance = new Settler(render()).$mount();
      await sleep(100);
      // Nothing subscribed, nothing queued: no frame was ever requested.
      expect(calls).toBe(0);

      instance.frame.start();
      await sleep(100);
      expect(calls).toBeGreaterThan(2);
      expect(instance.ticks).toBeGreaterThan(0);

      instance.frame.stop();
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

  it('works on anything that returns its own unsubscribe, outside a component', () => {
    const calls: string[] = [];
    const handle = toggle(() => {
      calls.push('subscribe');
      return () => calls.push('unsubscribe');
    });

    // No instance, no hook, no string key: `$enable`/`$disable` could not be
    // used here at all.
    const { start, stop } = handle;
    start();
    start();
    expect(handle.isActive).toBe(true);
    stop();
    stop();
    expect(handle.isActive).toBe(false);
    expect(calls).toEqual(['subscribe', 'unsubscribe']);
  });

  it('honours a synchronous stop while the subscription is starting', () => {
    const activity: boolean[] = [];
    let cleanups = 0;
    let handle!: ReturnType<typeof toggle>;
    handle = toggle(() => {
      activity.push(handle.isActive);
      handle.stop();
      activity.push(handle.isActive);
      return () => {
        cleanups += 1;
      };
    });

    handle.start();
    expect(activity).toEqual([true, false]);
    expect(handle.isActive).toBe(false);
    expect(cleanups).toBe(1);

    handle.stop();
    expect(cleanups).toBe(1);
  });

  it('can restart after a synchronous startup stop', () => {
    let subscriptions = 0;
    let cleanups = 0;
    let stopDuringStart = true;
    let handle!: ReturnType<typeof toggle>;
    handle = toggle(() => {
      subscriptions += 1;
      if (stopDuringStart) {
        handle.stop();
      }
      return () => {
        cleanups += 1;
      };
    });

    handle.start();
    expect(handle.isActive).toBe(false);
    expect([subscriptions, cleanups]).toEqual([1, 1]);

    stopDuringStart = false;
    handle.start();
    expect(handle.isActive).toBe(true);
    expect([subscriptions, cleanups]).toEqual([2, 1]);

    handle.stop();
    expect(handle.isActive).toBe(false);
    expect([subscriptions, cleanups]).toEqual([2, 2]);
  });

  it('keeps nested starts idempotent and repeated startup stops pending once', () => {
    let subscriptions = 0;
    let cleanups = 0;
    let handle!: ReturnType<typeof toggle>;
    handle = toggle(() => {
      subscriptions += 1;
      handle.start();
      handle.start();
      handle.stop();
      handle.stop();
      handle.start();
      return () => {
        cleanups += 1;
        handle.stop();
      };
    });

    handle.start();
    expect(handle.isActive).toBe(false);
    expect([subscriptions, cleanups]).toEqual([1, 1]);

    handle.start();
    expect(handle.isActive).toBe(false);
    expect([subscriptions, cleanups]).toEqual([2, 2]);
  });

  it('resets the starting state when subscribe throws', () => {
    let shouldThrow = true;
    let subscriptions = 0;
    let cleanups = 0;
    let handle!: ReturnType<typeof toggle>;
    handle = toggle(() => {
      subscriptions += 1;
      expect(handle.isActive).toBe(true);
      if (shouldThrow) {
        throw new Error('subscribe failed');
      }
      return () => {
        cleanups += 1;
      };
    });

    expect(() => handle.start()).toThrow('subscribe failed');
    expect(handle.isActive).toBe(false);
    handle.stop();

    shouldThrow = false;
    handle.start();
    expect(handle.isActive).toBe(true);
    expect(subscriptions).toBe(2);

    handle.stop();
    expect(handle.isActive).toBe(false);
    expect(cleanups).toBe(1);
  });
});
