import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { INSTANCES } from '../../src/protocol-symbols.js';
import { resetDom, settle, waitFor } from '../../src/test/index.js';
import { AnchorNavTarget } from './AnchorNavTarget.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

registerComponents(AnchorNavTarget);

afterEach(resetDom);

/** A bounded quiet period, for the assertion that nothing has mounted yet. */
async function quiet(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

const mountedState = (el: HTMLElement) => el[INSTANCES]?.get('AnchorNavTarget')?.$isMounted;

function render(style: string): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-component', 'AnchorNavTarget');
  el.setAttribute('style', style);
  document.body.append(el);
  return el;
}

describe('AnchorNavTarget', () => {
  it('mounts once scrolled into view', async () => {
    const el = render(OFFSCREEN);
    await quiet();
    expect(mountedState(el)).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await waitFor(() => mountedState(el));
    expect(mountedState(el)).toBe(true);
  });

  it('unmounts once scrolled back out of view', async () => {
    const el = render(ONSCREEN);
    await waitFor(() => mountedState(el));
    expect(mountedState(el)).toBe(true);

    el.setAttribute('style', OFFSCREEN);
    await waitFor(() => mountedState(el) === false);
    expect(mountedState(el)).toBe(false);
  });
});
