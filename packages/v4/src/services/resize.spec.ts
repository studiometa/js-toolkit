import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useResize, useWindowSize, type ResizeProps } from './resize.js';

function snapshot(props: ResizeProps): ResizeProps {
  return { ...props };
}

function resizeDocument(width: string): void {
  document.documentElement.style.width = width;
}

afterEach(() => {
  document.documentElement.style.width = '';
  document.body.innerHTML = '';
});

function makeBox(width: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('style', `width:${width};height:50px`);
  document.body.append(el);
  return el;
}

describe('useResize', () => {
  it('reports the viewport to a subscriber that asks for it', async () => {
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });

    const props = seen.at(0);
    expect(seen).toHaveLength(1);
    expect(props?.width).toBe(window.innerWidth);
    expect(props?.height).toBe(window.innerHeight);
    expect(props?.ratio).toBe(window.innerWidth / window.innerHeight);
    expect(props?.orientation).toBe(
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    );

    await settle();
    expect(seen).toHaveLength(1);
    unsubscribe();
  });

  it('says nothing on subscribe when nothing asked', async () => {
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => seen.push(snapshot(props)));
    await settle();

    expect(seen).toEqual([]);
    window.dispatchEvent(new Event('resize'));
    await settle();
    expect(seen).toHaveLength(1);
    unsubscribe();
  });

  it('stays quiet when the document grew but the viewport did not move', async () => {
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });
    await settle();
    const onSubscribe = seen.length;

    const spacer = document.createElement('div');
    spacer.setAttribute('style', 'height:4000px');
    document.body.append(spacer);
    await settle();

    expect(seen.length).toBe(onSubscribe);
    spacer.remove();
    await settle();
    expect(seen.length).toBe(onSubscribe);
    unsubscribe();
  });

  it('re-measures for each run, so a restarted service is current', async () => {
    const el = makeBox('120px');
    const first: ResizeProps[] = [];
    const off = useResize(el).subscribe((props) => first.push(snapshot(props)), {
      immediate: true,
    });
    expect(first.at(0)?.width).toBe(120);
    off();

    el.style.width = '60px';
    await settle();

    const second: ResizeProps[] = [];
    const unsubscribe = useResize(el).subscribe((props) => second.push(snapshot(props)), {
      immediate: true,
    });
    expect(second.at(0)?.width).toBe(60);
    unsubscribe();
  });

  it('ignores a change to the root box that leaves the viewport alone', async () => {
    let calls = 0;
    const unsubscribe = useResize().subscribe(() => {
      calls += 1;
    });
    await settle();
    const initial = calls;

    resizeDocument('320px');
    await settle();
    expect(calls).toBe(initial);

    unsubscribe();
  });

  it('emits on a viewport resize the observer cannot see', async () => {
    let calls = 0;
    const unsubscribe = useResize().subscribe(() => {
      calls += 1;
    });
    await settle();
    const initial = calls;

    window.dispatchEvent(new Event('resize'));
    await settle();
    expect(calls).toBeGreaterThan(initial);

    unsubscribe();
    const frozen = calls;
    window.dispatchEvent(new Event('resize'));
    await settle();
    expect(calls).toBe(frozen);
  });

  it('stops observing when the last subscriber leaves', async () => {
    let calls = 0;
    const unsubscribe = useResize().subscribe(() => {
      calls += 1;
    });
    await settle();
    unsubscribe();

    const frozen = calls;
    resizeDocument('280px');
    await settle();
    expect(calls).toBe(frozen);
  });

  it('is the viewport service when no target is given', () => {
    expect(useResize()).toBe(useWindowSize());
    expect(useResize(document.documentElement)).toBe(useWindowSize());
  });
});

describe('useResize(element)', () => {
  it('reports the element box rather than the viewport', async () => {
    const el = makeBox('120px');
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize(el).subscribe((props) => seen.push(snapshot(props)), {
      immediate: true,
    });
    await settle();

    const props = seen.at(-1);
    expect(props?.width).toBe(120);
    expect(props?.height).toBe(50);
    expect(props?.orientation).toBe('landscape');

    el.style.width = '40px';
    await settle();
    expect(seen.at(-1)?.width).toBe(40);
    expect(seen.at(-1)?.orientation).toBe('portrait');

    unsubscribe();
  });

  it('reports no ratio for a collapsed element', async () => {
    const el = document.createElement('div');
    el.setAttribute('style', 'width:120px;height:0');
    document.body.append(el);

    const service = useResize(el);
    const unsubscribe = service.subscribe(() => {});
    await settle();

    expect(service.props().height).toBe(0);
    expect(service.props().ratio).toBe(0);
    expect(service.props().orientation).toBe('landscape');

    unsubscribe();
  });

  it('keeps one service per element, each with its own subscribers', async () => {
    const first = makeBox('120px');
    const second = makeBox('120px');
    expect(useResize(first)).toBe(useResize(first));
    expect(useResize(first)).not.toBe(useResize(second));
    expect(useResize(first)).not.toBe(useResize());

    let firstCalls = 0;
    let secondCalls = 0;
    const unsubscribeFirst = useResize(first).subscribe(() => {
      firstCalls += 1;
    });
    const unsubscribeSecond = useResize(second).subscribe(() => {
      secondCalls += 1;
    });
    await settle();

    unsubscribeFirst();
    const frozen = firstCalls;
    const observed = secondCalls;
    first.style.width = '30px';
    second.style.width = '30px';
    await settle();

    expect(firstCalls).toBe(frozen);
    expect(secondCalls).toBeGreaterThan(observed);
    unsubscribeSecond();
  });
});
