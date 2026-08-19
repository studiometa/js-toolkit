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

async function render(): Promise<{ root: HTMLElement; target: HTMLElement }> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="AnchorNav">
      <a data-component="AnchorNavLink" href="#one" data-option-enter-to="active" data-option-enter-keep="true" data-option-leave-keep="false"></a>
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
    expect(link.$el.classList.contains('active')).toBe(true);
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
