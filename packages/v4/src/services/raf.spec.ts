import { describe, expect, it } from 'vitest';
import { scheduler } from '../scheduler.js';
import { frames } from '../test-utils.js';
import { useRaf, type RafProps } from './raf.js';

describe('useRaf', () => {
  it('ticks every frame with the elapsed time', async () => {
    const props: RafProps[] = [];
    const unsubscribe = useRaf().subscribe((frameProps) => props.push({ ...frameProps }));
    await frames(4);
    unsubscribe();

    expect(props.length).toBeGreaterThanOrEqual(2);
    expect(props[1].time).toBeGreaterThan(props[0].time);
    expect(props[1].delta).toBeGreaterThan(0);
    // The service keeps the last props for whoever asks without subscribing.
    expect(useRaf().props().time).toBe(props.at(-1)?.time);
  });

  it('measures in the read phase and renders in the write phase of the same frame', async () => {
    const phases: string[] = [];
    let time = 0;
    const unsubscribe = useRaf().subscribe((props) => {
      phases.push(scheduler.phase);
      time = props.time;
      return (renderProps: RafProps) => {
        phases.push(scheduler.phase);
        // The render is given the props of the frame it belongs to.
        expect(renderProps.time).toBe(time);
      };
    });
    await frames(2);
    unsubscribe();

    expect(phases.slice(0, 2)).toEqual(['read', 'write']);
  });

  it('cancels a render whose subscriber left between the two phases', async () => {
    let writes = 0;
    let unsubscribeFirst = (): void => {};
    // Collected in `read`, run in `write` — with a whole fan-out in between,
    // which is long enough for the component that returned it to be
    // destroyed. Its cleanup has already run, so the write must not happen.
    unsubscribeFirst = useRaf().subscribe(() => () => {
      writes += 1;
    });
    const unsubscribeSecond = useRaf().subscribe(() => {
      unsubscribeFirst();
    });

    await frames(3);
    unsubscribeSecond();

    expect(writes).toBe(0);
  });

  it('shares one loop between subscribers and stops with the last of them', async () => {
    let first = 0;
    let second = 0;
    const unsubscribeFirst = useRaf().subscribe(() => {
      first += 1;
    });
    const unsubscribeSecond = useRaf().subscribe(() => {
      second += 1;
    });
    await frames(3);
    expect(first).toBe(second);

    unsubscribeFirst();
    const frozen = first;
    await frames(3);
    expect(first).toBe(frozen);
    expect(second).toBeGreaterThan(frozen);

    unsubscribeSecond();
    const stopped = second;
    await frames(3);
    expect(second).toBe(stopped);
  });
});
