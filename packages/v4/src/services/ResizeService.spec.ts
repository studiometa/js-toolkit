import { afterEach, describe, expect, it } from 'vitest';
import { settle } from '../test-utils.js';
import { BREAKPOINTS, useResize, type ResizeProps } from './ResizeService.js';

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
});

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
});
