import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { INSTANCES } from '../../src/protocol-symbols.js';
import { resetDom, settle } from '../../src/test-utils.js';
import { AnchorNavTarget } from './AnchorNavTarget.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

registerComponents(AnchorNavTarget);

afterEach(resetDom);

async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

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
    await observed();
    expect(el[INSTANCES]?.get('AnchorNavTarget')?.$isMounted).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect(el[INSTANCES]?.get('AnchorNavTarget')?.$isMounted).toBe(true);
  });

  it('unmounts once scrolled back out of view', async () => {
    const el = render(ONSCREEN);
    await observed();
    expect(el[INSTANCES]?.get('AnchorNavTarget')?.$isMounted).toBe(true);

    el.setAttribute('style', OFFSCREEN);
    await observed();
    expect(el[INSTANCES]?.get('AnchorNavTarget')?.$isMounted).toBe(false);
  });
});
