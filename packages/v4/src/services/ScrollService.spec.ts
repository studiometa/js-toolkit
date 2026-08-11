import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useScroll, type ScrollProps } from './ScrollService.js';

/**
 * The props object is mutated in place, so every emission has to be read at
 * once rather than kept as a reference.
 */
function snapshot(props: ScrollProps) {
  return {
    y: props.y,
    lastY: props.last.y,
    deltaY: props.delta.y,
    maxY: props.max.y,
    progressY: props.progress.y,
    directionY: props.direction.y,
  };
}

function makePage(): void {
  const spacer = document.createElement('div');
  spacer.setAttribute('style', 'height:300vh');
  document.body.append(spacer);
}

afterEach(() => {
  document.body.innerHTML = '';
  window.scrollTo(0, 0);
});

describe('useScroll', () => {
  it('reports the position, its delta, its progress and its direction', async () => {
    makePage();
    const seen: Array<ReturnType<typeof snapshot>> = [];
    const unsubscribe = useScroll().add((props) => seen.push(snapshot(props)));

    window.scrollTo(0, 200);
    await settle();

    const down = seen.at(-1);
    expect(down?.y).toBe(200);
    expect(down?.lastY).toBe(0);
    expect(down?.deltaY).toBe(200);
    expect(down?.directionY).toBe('DOWN');
    expect(down?.maxY).toBeGreaterThan(0);
    expect(down?.progressY).toBeCloseTo(200 / (down?.maxY ?? 1), 5);

    window.scrollTo(0, 50);
    await settle();

    const up = seen.at(-1);
    expect(up?.y).toBe(50);
    expect(up?.deltaY).toBe(-150);
    expect(up?.directionY).toBe('UP');

    unsubscribe();
  });

  it('emits once per frame however many scroll events arrive', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().add(() => {
      calls += 1;
    });

    for (let i = 1; i <= 5; i += 1) {
      window.scrollTo(0, i * 20);
    }
    await settle();
    unsubscribe();

    // Five positions, one measurement — and it reports the last one.
    expect(calls).toBe(1);
    expect(useScroll().props().y).toBe(100);
  });

  it('stops listening when the last subscriber leaves', async () => {
    makePage();
    let calls = 0;
    const unsubscribe = useScroll().add(() => {
      calls += 1;
    });

    window.scrollTo(0, 120);
    await settle();
    expect(calls).toBe(1);

    unsubscribe();
    window.scrollTo(0, 240);
    await settle();
    expect(calls).toBe(1);
  });
});
