import { describe, expect, it } from 'vitest';
import { scheduler } from '../scheduler.js';
import { frames } from '../test-utils.js';
import { useRaf, type RafProps } from './RafService.js';

describe('useRaf', () => {
  it('ticks every frame with the elapsed time', async () => {
    const props: RafProps[] = [];
    const unsubscribe = useRaf().add((frameProps) => props.push({ ...frameProps }));
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
    const unsubscribe = useRaf().add((props) => {
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

  it('shares one loop between subscribers and stops with the last of them', async () => {
    let first = 0;
    let second = 0;
    const unsubscribeFirst = useRaf().add(() => {
      first += 1;
    });
    const unsubscribeSecond = useRaf().add(() => {
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
