import { describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { createService, type MutableProps } from './service.js';
import { useScroll } from './scroll.js';
import { until } from './until.js';

interface Position {
  readonly x: number;
}

/**
 * A service with a hand-driven emit, so a test can decide exactly when an
 * update happens — and whether one happens at all.
 */
function makeService(initial = 0, hasProps?: () => boolean) {
  const props: MutableProps<Position> = { x: initial };
  const calls: string[] = [];
  let emit!: (props: Position) => void;
  const service = createService<Position>({
    props: () => props,
    hasProps,
    start(fan) {
      emit = fan;
      calls.push('start');
      return () => calls.push('stop');
    },
  });
  return {
    service,
    calls,
    move(x: number) {
      props.x = x;
      emit(props);
    },
  };
}

describe('until', () => {
  it('resolves on the first update that matches, and releases the service', async () => {
    const { service, calls, move } = makeService();

    const settled = until(service, ({ x }) => x > 10);
    expect(calls).toEqual(['start']);

    move(5);
    move(20);
    // The subscription is released before the promise resolves, so the service
    // it was holding stops with it.
    expect(calls).toEqual(['start', 'stop']);
    await expect(settled).resolves.toEqual({ x: 20 });
  });

  it('resolves on the current props when they already match', async () => {
    const { service, calls, move } = makeService(50);

    // Asking whether a scroll has finished must not wait for the next scroll to
    // answer. The match arrives from inside `subscribe()`, which is where the
    // hand-rolled version leaks: its `unsubscribe` is still `null` there, so
    // nothing releases the subscription and the service never stops.
    await expect(until(service, ({ x }) => x > 10)).resolves.toEqual({ x: 50 });
    expect(calls).toEqual(['start', 'stop']);

    // Nothing is left listening: an update after the fact reaches no one.
    move(0);
    expect(calls).toEqual(['start', 'stop']);
  });

  it('waits for the first update of a source with no current props', async () => {
    // The frame tick between two frames, the pointer before it has been seen: a
    // resting value is not a reading, so there is nothing to match against.
    const { service, calls, move } = makeService(50, () => false);

    let isResolved = false;
    const settled = until(service, ({ x }) => x > 10).then((props) => {
      isResolved = true;
      return props;
    });
    await settle();
    expect(isResolved).toBe(false);

    move(60);
    await expect(settled).resolves.toEqual({ x: 60 });
    expect(calls).toEqual(['start', 'stop']);
  });

  it('resolves once, whatever the source does next', async () => {
    const { service, move } = makeService();

    let resolutions = 0;
    const settled = until(service, ({ x }) => x > 10).then(() => {
      resolutions += 1;
    });
    move(20);
    move(30);
    move(40);
    await settled;

    expect(resolutions).toBe(1);
  });

  it('resolves with a copy, not with the object the service owns', async () => {
    const { service, move } = makeService();

    const settled = until(service, ({ x }) => x > 10);
    move(20);
    // The sampled sources hand the same object to every subscriber and
    // overwrite it on the next update — which happens here before the `await`
    // resumes, a microtask later.
    move(999);

    expect(await settled).toEqual({ x: 20 });
    expect(await settled).not.toBe(service.props());
  });

  it('waits for a real scroll to settle', async () => {
    const el = document.createElement('div');
    el.style.cssText = 'width:100px;height:100px;overflow:auto';
    el.innerHTML = '<div style="width:100px;height:1000px"></div>';
    document.body.append(el);

    const service = useScroll(el);
    // Held for the whole test, so the service keeps running between the two
    // waits: releasing it would reset the flag and make the second one vacuous.
    const keep = service.subscribe(() => {});

    try {
      // Both waits start before what they are waiting for, so neither resolves
      // on the current props.
      const started = until(service, ({ isScrolling }) => isScrolling);
      // A scroll with no `scrollend` behind it, which is what mid-gesture looks
      // like — a real jump starts and settles inside one frame, and the
      // coalesced read would only ever report the settled state.
      el.dispatchEvent(new Event('scroll'));
      await started;

      // Whichever mechanism ends the scroll — `scrollend`, or the quiet period
      // standing in for it — this is the wait `isScrolling` was documented to
      // support and had no verb for.
      const settled = until(service, ({ isScrolling }) => !isScrolling);
      el.scrollTop = 200;
      const props = await settled;

      expect(props.isScrolling).toBe(false);
      expect(props.y).toBe(200);
    } finally {
      keep();
      el.remove();
      await settle();
    }
  });
});
