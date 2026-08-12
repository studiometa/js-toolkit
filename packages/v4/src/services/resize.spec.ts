import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import {
  BREAKPOINTS,
  getBreakpoints,
  setBreakpoints,
  useResize,
  useWindowSize,
  type ResizeProps,
} from './resize.js';

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
  setBreakpoints(BREAKPOINTS);
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
    const unsubscribe = useResize().add((props) => seen.push(snapshot(props)));
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
    expect(Object.keys(BREAKPOINTS)).toContain(props?.breakpoint);
  });

  it('emits again when the document is resized', async () => {
    let calls = 0;
    const unsubscribe = useResize().add(() => {
      calls += 1;
    });
    await settle();
    const initial = calls;

    resizeDocument('320px');
    await settle();
    expect(calls).toBeGreaterThan(initial);

    unsubscribe();
  });

  it('emits on a viewport resize the observer cannot see', async () => {
    // The observer watches `documentElement`'s box, and for the root element
    // `clientWidth`/`clientHeight` are the viewport instead. On a page taller
    // than the viewport the two are decoupled — measured height 3000 against
    // a `clientHeight` of 896 — so a viewport-only height change, a mobile
    // toolbar sliding away, moves the props and fires no observer at all.
    let calls = 0;
    const unsubscribe = useResize().add(() => {
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
    const unsubscribe = useResize().add(() => {
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

describe('breakpoints', () => {
  it('answers with the named set, and with the one that replaced it', async () => {
    expect(getBreakpoints()).toEqual(BREAKPOINTS);

    const unsubscribe = useResize().add(() => {});
    await settle();
    expect(Object.keys(BREAKPOINTS)).toContain(useResize().props().breakpoint);

    // Every width matches, so the widest name wins whatever the viewport is.
    setBreakpoints({ small: '0rem', large: '0rem' });
    expect(getBreakpoints()).toEqual({ small: '0rem', large: '0rem' });

    resizeDocument('320px');
    await settle();
    expect(useResize().props().breakpoint).toBe('large');

    unsubscribe();
  });
});

describe('useResize(element)', () => {
  it('reports the element box rather than the viewport', async () => {
    const el = makeBox('120px');
    const seen: ResizeProps[] = [];
    const unsubscribe = useResize(el).add((props) => seen.push(snapshot(props)));
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
    const unsubscribe = service.add(() => {});
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
    const unsubscribeFirst = useResize(first).add(() => {
      firstCalls += 1;
    });
    const unsubscribeSecond = useResize(second).add(() => {
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
