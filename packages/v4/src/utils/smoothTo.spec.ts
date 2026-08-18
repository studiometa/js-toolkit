import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { smoothTo, type SmoothTo } from './smoothTo.js';
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
    expect(x.isMoving).toBe(false);
    x.destroy();
  });

  it('holds one frame subscription however many times the target is set', async () => {
    const x = smoothTo(0);
    const seen: number[] = [];
    x.subscribe((value) => seen.push(value));

    for (let index = 1; index <= 5; index += 1) {
      x(index * 100);
    }
    expect(seen).toEqual([]);

    await frames(1);
    expect(seen.length).toBe(1);

    await frames(1);
    expect(seen.length).toBe(2);
    x.destroy();
  });

  it('converges at the same rate however often it was set', async () => {
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

  it('reads a damping function on every frame, so a changed factor counts', async () => {
    let factor = 0.99;
    const reads: number[] = [];
    const x = smoothTo(0, {
      damping: () => {
        reads.push(factor);
        return factor;
      },
    });

    x(100);
    await frames(2);
    const slow = x();
    expect(reads.length).toBeGreaterThan(1);

    // Nothing is re-created and no target is set again: only the factor moves.
    factor = 0.1;
    await frames(2);

    expect(x()).toBeGreaterThan(slow);
    expect(reads.at(-1)).toBe(0.1);
    x.destroy();
  });

  it('lets the factor depend on the direction of travel', async () => {
    // The same rule in both: fall fast, rise slowly.
    const rule = (channel: { (): number; raw(): number }) => () =>
      channel.raw() < channel() ? 0.9 : 0.1;
    const falling: SmoothTo = smoothTo(100, { damping: () => rule(falling)() });
    const rising: SmoothTo = smoothTo(0, { damping: () => rule(rising)() });

    falling(0);
    rising(100);
    await frames(2);

    // Same distance asked for, opposite directions, different factor applied.
    expect(100 - falling()).toBeGreaterThan(rising());
    falling.destroy();
    rising.destroy();
  });

  it('springs when a spring parameter is named', async () => {
    const x = smoothTo(0, { stiffness: 0.6, damping: 0.4 });
    const peak: number[] = [];
    x.subscribe((value) => peak.push(value));
    x(100);
    await frames(40);

    expect(x()).toBe(100);
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

/** Wait for every channel to arrive, bounded so a stuck value fails the test. */
async function settled(motion: { readonly isMoving: boolean }, max = 300): Promise<void> {
  for (let index = 0; index < max && motion.isMoving; index += 1) {
    await frames(1);
  }
}

describe('smoothTo — a record of named channels', () => {
  it('narrows to a number or to a record from what it was started with', () => {
    const scalar = smoothTo(0);
    const record = smoothTo({ x: 0, scale: 1 });

    expectTypeOf(scalar()).toEqualTypeOf<number>();
    expectTypeOf(scalar.raw()).toEqualTypeOf<number>();
    expectTypeOf(record()).toEqualTypeOf<Record<'x' | 'scale', number>>();
    expectTypeOf(record.jump({ scale: 2 })).toEqualTypeOf<Record<'x' | 'scale', number>>();

    scalar.destroy();
    record.destroy();
  });

  it('smooths every channel on one subscriber call per frame', async () => {
    const motion = smoothTo({ x: 0, y: 0, scale: 1 }, { damping: 0.9 });
    const seen: Array<{ x: number; y: number; scale: number }> = [];
    motion.subscribe((values) => seen.push({ ...values }));

    motion({ x: 100, y: 50, scale: 2 });
    await frames(3);

    // Three channels, three calls: a scalar trio would have made nine.
    expect(seen).toHaveLength(3);
    expect(seen[0].x).toBeGreaterThan(0);
    expect(seen[0].y).toBeGreaterThan(0);
    expect(seen[0].scale).toBeGreaterThan(1);

    await settled(motion);
    expect(motion()).toEqual({ x: 100, y: 50, scale: 2 });
    expect(motion.isMoving).toBe(false);
    motion.destroy();
  });

  it('sets only the channels a call names, mid-flight included', async () => {
    const motion = smoothTo({ x: 0, y: 0 }, { damping: 0.5 });

    motion({ x: 100, y: 100 });
    await frames(2);
    const travellingY = motion().y;

    // Re-aiming `x` says nothing about `y`, which keeps its own target.
    motion({ x: 0 });
    expect(motion.raw()).toEqual({ x: 0, y: 100 });
    await frames(1);
    expect(motion().y).toBeGreaterThan(travellingY);

    await settled(motion);
    expect(motion()).toEqual({ x: 0, y: 100 });
    motion.destroy();
  });

  it('gives each channel its own rate through the damping hook', async () => {
    const motion = smoothTo(
      { fast: 0, slow: 0 },
      { damping: (key) => (key === 'fast' ? 0.9 : 0.05) },
    );

    motion({ fast: 100, slow: 100 });
    await frames(3);

    expect(motion().fast).toBeGreaterThan(motion().slow);
    motion.destroy();
  });

  it('keeps the frame until the last channel arrives', async () => {
    const motion = smoothTo(
      { quick: 0, lazy: 0 },
      { damping: (key) => (key === 'quick' ? 0.95 : 0.35) },
    );

    motion({ quick: 10, lazy: 10 });
    await frames(6);

    // One channel is home and the other is not, so the subscription stays.
    expect(motion().quick).toBe(10);
    expect(motion().lazy).toBeLessThan(10);
    expect(motion.isMoving).toBe(true);

    await settled(motion);
    expect(motion()).toEqual({ quick: 10, lazy: 10 });
    expect(motion.isMoving).toBe(false);
    motion.destroy();
  });

  it('hands the same record object to every reader on every frame', async () => {
    const motion = smoothTo({ x: 0 });
    const readings: Array<Record<'x', number>> = [];
    motion.subscribe((values) => readings.push(values));

    motion({ x: 100 });
    await frames(2);

    expect(readings.length).toBeGreaterThan(1);
    expect(readings[0]).toBe(readings[1]);
    expect(readings[0]).toBe(motion());
    motion.destroy();
  });

  it('moves named targets by a delta each', async () => {
    const motion = smoothTo({ x: 10, y: 20 }, { damping: 0.9 });

    motion.add({ x: 5 });
    expect(motion.raw()).toEqual({ x: 15, y: 20 });

    await frames(15);
    expect(motion()).toEqual({ x: 15, y: 20 });
    motion.destroy();
  });

  it('jumps a value and its target together, without a frame', async () => {
    const motion = smoothTo({ x: 0, y: 0 }, { damping: 0.2 });

    motion({ x: 100, y: 100 });
    await frames(2);
    expect(motion.isMoving).toBe(true);

    const requested = await countRequestedFrames(async () => {
      motion.jump({ x: 0, y: 0 });
      await frames(3);
    });

    expect(motion()).toEqual({ x: 0, y: 0 });
    expect(motion.raw()).toEqual({ x: 0, y: 0 });
    expect(motion.isMoving).toBe(false);
    // Only the frames the test itself asked for.
    expect(requested).toBeLessThanOrEqual(4);
    motion.destroy();
  });

  it('leaves a channel a jump does not name still travelling', async () => {
    const motion = smoothTo({ x: 0, y: 0 }, { damping: 0.5 });

    motion({ x: 100, y: 100 });
    await frames(2);
    motion.jump({ x: 0 });

    expect(motion().x).toBe(0);
    expect(motion.isMoving).toBe(true);

    await settled(motion);
    expect(motion()).toEqual({ x: 0, y: 100 });
    motion.destroy();
  });

  it('springs every channel when a spring parameter is named', async () => {
    const motion = smoothTo({ x: 0, y: 0 }, { stiffness: 0.2 });

    motion({ x: 100, y: 100 });
    await frames(4);

    expect(motion().x).toBeGreaterThan(0);
    expect(motion().x).toBe(motion().y);
    motion.destroy();
  });
});
