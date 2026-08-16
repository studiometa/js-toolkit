import { describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { createService, type MutableProps } from './service.js';
import { useScroll } from './scroll.js';
import { until } from './until.js';

interface Position {
  readonly x: number;
}

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
    expect(calls).toEqual(['start', 'stop']);
    await expect(settled).resolves.toEqual({ x: 20 });
  });

  it('resolves on the current props when they already match', async () => {
    const { service, calls, move } = makeService(50);

    await expect(until(service, ({ x }) => x > 10)).resolves.toEqual({ x: 50 });
    expect(calls).toEqual(['start', 'stop']);

    move(0);
    expect(calls).toEqual(['start', 'stop']);
  });

  it('waits for the first update of a source with no current props', async () => {
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
    const keep = service.subscribe(() => {});

    try {
      const started = until(service, ({ isScrolling }) => isScrolling);
      el.dispatchEvent(new Event('scroll'));
      await started;

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
