import { afterEach, describe, expect, it } from 'vitest';
import { getInstance, registerComponents } from '../../src/index.js';
import { mount, resetDom, settle, waitFor } from '../../src/test/index.js';
import { AnchorNav } from './AnchorNav.js';
import { AnchorNavLink } from './AnchorNavLink.js';
import { AnchorNavTarget } from './AnchorNavTarget.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

registerComponents(AnchorNav, AnchorNavLink, AnchorNavTarget);

afterEach(resetDom);

async function render(): Promise<{ root: HTMLElement; target: HTMLElement }> {
  const root = await mount(`
    <div data-component="AnchorNav">
      <a data-component="AnchorNavLink" href="#one" data-option-enter-to="active" data-option-enter-keep="true"></a>
      <div id="one" data-component="AnchorNavTarget" style="${OFFSCREEN}"></div>
    </div>`);
  return { root, target: root.querySelector('#one') as HTMLElement };
}

describe('AnchorNav', () => {
  it('enters the matching link once its target scrolls into view', async () => {
    const { root, target } = await render();
    const link = getInstance<AnchorNavLink>(
      root.querySelector('[data-component="AnchorNavLink"]')!,
      'AnchorNavLink',
    )!;

    target.setAttribute('style', ONSCREEN);
    await waitFor(() => link.state === 'entering');

    expect(link.state).toBe('entering');
    // `AnchorNav` fire-and-forgets the transition, so the kept end state lands
    // a few frames after the state change and has to be polled for.
    await waitFor(() => link.$el.classList.contains('active'));
  });

  it('leaves the matching link once its target scrolls back out of view', async () => {
    const { root, target } = await render();
    const link = getInstance<AnchorNavLink>(
      root.querySelector('[data-component="AnchorNavLink"]')!,
      'AnchorNavLink',
    )!;

    target.setAttribute('style', ONSCREEN);
    await waitFor(() => link.state === 'entering');
    target.setAttribute('style', OFFSCREEN);
    await waitFor(() => link.state === 'leaving');

    expect(link.state).toBe('leaving');
    // A removal is asserted directly, never polled for: `leaveTransition()`
    // clears the other direction's class before its first await.
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
      root.querySelector('[data-component="AnchorNavLink"]')!,
      'AnchorNavLink',
    )!;
    const target = root.querySelector('#one') as HTMLElement;

    target.setAttribute('style', ONSCREEN);
    // An absence cannot be polled for, so this keeps a bounded quiet period.
    for (let i = 0; i < 6; i += 1) {
      await settle();
    }

    expect(link.state).toBeNull();
  });
});
