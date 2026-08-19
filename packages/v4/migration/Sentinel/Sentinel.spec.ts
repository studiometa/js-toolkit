import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents, type InViewProps } from '../../src/index.js';
import { resetDom, settle } from '../../src/test-utils.js';
import { Sentinel } from './Sentinel.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

registerComponents(Sentinel);

afterEach(resetDom);

/** Give the observer a few frames to deliver. */
async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

function render(style: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-component', 'Sentinel');
  el.setAttribute('style', style);
  document.body.append(el);
  return el;
}

describe('Sentinel', () => {
  it('emits `intersected` with the initial entry as soon as it observes, like the v3 decorator', async () => {
    const el = render(OFFSCREEN);
    const events: InViewProps[] = [];
    el.addEventListener('intersected', (event) => {
      events.push((event as CustomEvent<InViewProps>).detail);
    });
    await observed();

    expect(events).toHaveLength(1);
    expect(events[0].isInView).toBe(false);
  });

  it('emits `intersected` with the raw entry when it enters the viewport', async () => {
    const el = render(OFFSCREEN);
    const events: InViewProps[] = [];
    el.addEventListener('intersected', (event) => {
      events.push((event as CustomEvent<InViewProps>).detail);
    });
    await observed();

    el.setAttribute('style', ONSCREEN);
    await observed();

    const last = events.at(-1);
    expect(last?.isInView).toBe(true);
    expect(last?.entry?.isIntersecting).toBe(true);
  });

  it('emits `intersected` with the raw entry when it leaves the viewport', async () => {
    const el = render(ONSCREEN);
    const events: InViewProps[] = [];
    el.addEventListener('intersected', (event) => {
      events.push((event as CustomEvent<InViewProps>).detail);
    });
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();

    const last = events.at(-1);
    expect(last?.isInView).toBe(false);
  });

  /**
   * The whole point of `Sentinel` over `InView`: the entry's geometry survives,
   * so a consumer such as `Sticky` can tell "scrolled above the viewport top"
   * apart from "scrolled below the viewport bottom".
   */
  it('exposes `boundingClientRect` on the entry, which `InView` discards', async () => {
    const el = render(ONSCREEN);
    let lastProps: InViewProps | undefined;
    el.addEventListener('intersected', (event) => {
      lastProps = (event as CustomEvent<InViewProps>).detail;
    });
    await observed();

    expect(lastProps?.entry).toBeTruthy();
    expect(typeof lastProps?.entry?.boundingClientRect.y).toBe('number');
  });
});
