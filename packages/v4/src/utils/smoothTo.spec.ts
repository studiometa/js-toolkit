import { describe, expect, it, vi } from 'vitest';
import { smoothTo } from './smoothTo.js';
import { countRequestedFrames, frames } from '../test-utils.js';

describe('smoothTo', () => {
  it('starts at its start value and does not move on its own', async () => {
    const x = smoothTo(20);
    expect(x()).toBe(20);
    expect(x.raw()).toBe(20);
    expect(x.isMoving).toBe(false);

    await frames(3);
    expect(x()).toBe(20);
    x.destroy();
  });

  it('travels to the target and stops there exactly', async () => {
    const x = smoothTo(0, { damping: 0.9 });
    x(100);
    expect(x.isMoving).toBe(true);

    await frames(15);
    expect(x()).toBe(100);
    // Arrived means released: nothing is left holding the frame open.
    expect(x.isMoving).toBe(false);
    x.destroy();
  });

  it('holds one frame subscription however many times the target is set', async () => {
    // The v3 defect, measured on the v3 helper: `update()` ticked synchronously
    // and re-scheduled through `requestAnimationFrame` with nothing cancelling,
    // so five updates in one frame produced five chains, five notifications per
    // frame and five more frames queued.
    const x = smoothTo(0);
    const seen: number[] = [];
    x.subscribe((value) => seen.push(value));

    for (let index = 1; index <= 5; index += 1) {
      x(index * 100);
    }
    // Setting the target does not advance the value; only a frame does.
    expect(seen).toEqual([]);

    await frames(1);
    expect(seen.length).toBe(1);

    await frames(1);
    expect(seen.length).toBe(2);
    x.destroy();
  });

  it('converges at the same rate however often it was set', async () => {
    // The consequence of the chains: the value sped up with the number of
    // calls, so a smoothTo driven from a scroll handler moved faster the more
    // the user scrolled.
    const once = smoothTo(0, { damping: 0.5 });
    const many = smoothTo(0, { damping: 0.5 });
    once(100);
    for (let index = 0; index < 20; index += 1) {
      many(100);
    }

    await frames(8);
    expect(many()).toBeCloseTo(once(), 6);
    once.destroy();
    many.destroy();
  });

  it('does not ask for a frame while it is at rest', async () => {
    const x = smoothTo(0, { damping: 0.9 });
    x(50);
    await frames(15);
    expect(x.isMoving).toBe(false);

    // Nothing else is subscribed, so the raf service released its tick and the
    // scheduler has no reason to want another frame. `frames()` requests its
    // own, so those four are the floor.
    const requested = await countRequestedFrames(() => frames(4));

    expect(requested).toBe(4);
    x.destroy();
  });

  it('picks up a target that changes mid-flight', async () => {
    const x = smoothTo(0, { damping: 0.5 });
    x(100);
    await frames(2);
    const midway = x();
    expect(midway).toBeGreaterThan(0);
    expect(midway).toBeLessThan(100);

    x(0);
    await frames(25);
    expect(x()).toBe(0);
    x.destroy();
  });

  it('moves the target by a delta', async () => {
    const x = smoothTo(10);
    x.add(5);
    expect(x.raw()).toBe(15);
    x.add(-20);
    expect(x.raw()).toBe(-5);
    x.destroy();
  });

  it('springs when a spring parameter is named', async () => {
    // v3 inferred the mode from the parameters, which is the useful default.
    const x = smoothTo(0, { stiffness: 0.6, damping: 0.4 });
    const peak: number[] = [];
    x.subscribe((value) => peak.push(value));
    x(100);
    await frames(40);

    expect(x()).toBe(100);
    // A spring overshoots; damping never does.
    expect(Math.max(...peak)).toBeGreaterThan(100);
    x.destroy();
  });

  it('does not overshoot when damping', async () => {
    const x = smoothTo(0, { damping: 0.9 });
    const seen: number[] = [];
    x.subscribe((value) => seen.push(value));
    x(100);
    await frames(15);

    expect(x()).toBe(100);
    expect(Math.max(...seen)).toBe(100);
    x.destroy();
  });

  it('releases the frame and the subscribers on destroy', async () => {
    const x = smoothTo(0);
    const callback = vi.fn();
    x.subscribe(callback);
    x(100);
    await frames(2);
    expect(callback).toHaveBeenCalled();

    x.destroy();
    expect(x.isMoving).toBe(false);
    callback.mockClear();
    await frames(4);
    // v3 had no teardown at all, so a destroyed component's smoothing kept
    // whatever loops it had going.
    expect(callback).not.toHaveBeenCalled();
  });

  it('lets a subscriber leave without disturbing the others', async () => {
    const x = smoothTo(0);
    const first: number[] = [];
    const second: number[] = [];
    const off = x.subscribe((value) => first.push(value));
    x.subscribe((value) => second.push(value));

    x(100);
    await frames(2);
    off();
    const atUnsubscribe = first.length;
    await frames(3);

    expect(first.length).toBe(atUnsubscribe);
    expect(second.length).toBeGreaterThan(atUnsubscribe);
    x.destroy();
  });
});
