import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { useResize, useWindowSize, type ResizeProps } from './resize.js';

function snapshot(props: ResizeProps): ResizeProps {
  return { ...props };
}

/**
 * The observer watches the document element, so changing its box is what a
 * viewport resize looks like from inside the page.
 */
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
  it('reports the viewport as soon as a subscriber arrives', async () => {
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => seen.push(snapshot(props)));
    await settle();
    unsubscribe();

    // `ResizeObserver` delivers the current size on `observe()`, so a
    // component knows where it stands without waiting for a resize — v3
    // only spoke on the next `resize` event.
    const props = seen.at(-1);
    expect(seen.length).toBeGreaterThan(0);
    expect(props?.width).toBe(window.innerWidth);
    expect(props?.height).toBe(window.innerHeight);
    expect(props?.ratio).toBe(window.innerWidth / window.innerHeight);
    expect(props?.orientation).toBe(
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    );
  });

  it('stays quiet when the document grew but the viewport did not move', async () => {
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => seen.push(snapshot(props)));
    await settle();
    const onSubscribe = seen.length;

    // The observer watches `documentElement`'s own box, which on the root
    // element is the document height rather than the viewport. A lazy image,
    // an accordion or an infinite scroll page moves it constantly, and none of
    // it changes a single value these props report.
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

  it('delivers again to the next subscriber after the service restarted', async () => {
    const first: ResizeProps[] = [];
    const off = useResize().subscribe((props) => first.push(snapshot(props)));
    await settle();
    expect(first.length).toBeGreaterThan(0);
    // Last subscriber out: the service stops, so the change gate resets with
    // it and the next subscriber is told where it stands rather than waiting
    // for a resize that may never come.
    off();

    const second: ResizeProps[] = [];
    const unsubscribe = useResize().subscribe((props) => second.push(snapshot(props)));
    await settle();
    unsubscribe();

    expect(second.length).toBeGreaterThan(0);
    expect(second.at(-1)?.width).toBe(window.innerWidth);
  });

  it('ignores a change to the root box that leaves the viewport alone', async () => {
    let calls = 0;
    const unsubscribe = useResize().subscribe(() => {
      calls += 1;
    });
    await settle();
    const initial = calls;

    // This used to assert an emit, back when the observer published
    // unconditionally. It reports nothing: `clientWidth` on the root element
    // is the viewport, so narrowing `documentElement`'s own box moves the
    // observed rect and leaves every value in the props exactly as it was.
    // A real viewport resize is covered by the test below, through the
    // `resize` event, which is the mechanism that can actually see one.
    resizeDocument('320px');
    await settle();
    expect(calls).toBe(initial);

    unsubscribe();
  });

  it('emits on a viewport resize the observer cannot see', async () => {
    // The observer watches `documentElement`'s box, and for the root element
    // `clientWidth`/`clientHeight` are the viewport instead. On a page taller
    // than the viewport the two are decoupled — measured height 3000 against
    // a `clientHeight` of 896 — so a viewport-only height change, a mobile
    // toolbar sliding away, moves the props and fires no observer at all.
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
    const unsubscribe = useResize(el).subscribe((props) => seen.push(snapshot(props)));
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

    // `Infinity` and `NaN` propagate through everything a subscriber
    // computes from a ratio; a collapsed element simply has none.
    expect(service.props().height).toBe(0);
    expect(service.props().ratio).toBe(0);
    // And it is still described by the side it is wider on.
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

    // The last subscriber of one element leaves; its observer stops, and the
    // other element keeps being watched.
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
