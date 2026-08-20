import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { AnchorNav } from './AnchorNav.js';
import { AnchorNavLink } from './AnchorNavLink.js';
import { AnchorNavTarget } from './AnchorNavTarget.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

registerComponents(AnchorNav, AnchorNavLink, AnchorNavTarget);

afterEach(resetDom);

async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

/**
 * `AnchorNav` fire-and-forgets the link's transition, and a kept end state
 * lands a few frames after that — so the class is polled rather than assumed
 * present once the observer has delivered. `MenuList`'s spec has the same
 * helper for the same reason, after this shape flaked under full-suite load.
 */
async function waitForClass(el: HTMLElement, className: string, timeout = 1000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (!el.classList.contains(className)) {
    if (Date.now() > deadline) {
      throw new Error(`waitForClass: "${className}" never landed on the element`);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function render(): Promise<{ root: HTMLElement; target: HTMLElement }> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="AnchorNav">
      <a data-component="AnchorNavLink" href="#one" data-option-enter-to="active" data-option-enter-keep="true"></a>
      <div id="one" data-component="AnchorNavTarget" style="${OFFSCREEN}"></div>
    </div>`;
  document.body.append(root);
  await settle();
  return { root, target: root.querySelector('#one') as HTMLElement };
}

describe('AnchorNav', () => {
  it('enters the matching link once its target scrolls into view', async () => {
    const { root, target } = await render();
    const link = getInstance<AnchorNavLink>(
      root.querySelector('[data-component="AnchorNavLink"]'),
      'AnchorNavLink',
    );

    target.setAttribute('style', ONSCREEN);
    await observed();

    expect(link.state).toBe('entering');
    await waitForClass(link.$el, 'active');
  });

  it('leaves the matching link once its target scrolls back out of view', async () => {
    const { root, target } = await render();
    const link = getInstance<AnchorNavLink>(
      root.querySelector('[data-component="AnchorNavLink"]'),
      'AnchorNavLink',
    );

    target.setAttribute('style', ONSCREEN);
    await observed();
    target.setAttribute('style', OFFSCREEN);
    await observed();

    expect(link.state).toBe('leaving');
    expect(link.$el.classList.contains('active')).toBe(false);
  });

  it('ignores a link whose targetId does not match any target', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-component="AnchorNav">
        <a data-component="AnchorNavLink" href="#unrelated"></a>
        <div id="one" data-component="AnchorNavTarget" style="${OFFSCREEN}"></div>
      </div>`;
    document.body.append(root);
    await settle();
    const link = getInstance<AnchorNavLink>(
      root.querySelector('[data-component="AnchorNavLink"]'),
      'AnchorNavLink',
    );
    const target = root.querySelector('#one') as HTMLElement;

    target.setAttribute('style', ONSCREEN);
    await observed();

    expect(link.state).toBeNull();
  });
});
