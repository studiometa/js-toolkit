import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { ScrollTo } from './ScrollTo.js';

registerComponents(ScrollTo);

afterEach(async () => {
  await resetDom();
  document.body.removeAttribute('style');
  // A later `vi.spyOn(window, 'scrollTo')` reuses the same mock and its call
  // history otherwise, since nothing here ever restores the original.
  vi.restoreAllMocks();
});

// The test viewport's `<body>` has no natural height past the viewport, so a
// `position: absolute` target does not extend `scrollHeight` the way it would
// on a real page: an explicit body height is what `scrollTo`'s own spec uses
// to get a genuinely scrollable page in this harness.
async function render(href: string): Promise<{ el: HTMLAnchorElement; instance: ScrollTo }> {
  document.body.style.cssText = 'margin:0;height:3000px';
  const root = document.createElement('div');
  root.innerHTML = `
    <a data-component="ScrollTo" href="${href}">Jump</a>
    <div id="target" style="position:absolute;top:2000px"></div>`;
  document.body.append(root);
  await settle();
  const el = root.querySelector('[data-component="ScrollTo"]') as HTMLAnchorElement;
  return { el, instance: getInstance<ScrollTo>(el, 'ScrollTo') };
}

// Calling `onClick` directly, rather than dispatching a real click on a live
// `<a href>`, is deliberate: an untrusted `dispatchEvent` still runs an
// anchor's default navigation in a real browser when not prevented, which
// would tear down the test iframe (`href="/other-page"` proved it).
function clickEvent(): MouseEvent {
  return new MouseEvent('click', { cancelable: true });
}

describe('ScrollTo', () => {
  it('reads the target selector from the hash', async () => {
    const { instance } = await render('#target');
    expect(instance.targetSelector).toBe('#target');
  });

  it('prevents the jump and scrolls to the hash target when it exists', async () => {
    const { instance } = await render('#target');
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const event = clickEvent();

    instance.onClick(event);

    expect(event.defaultPrevented).toBe(true);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy.mock.calls[0][0]).toMatchObject({ top: 2000 });
  });

  it('leaves the click alone when the hash target does not exist', async () => {
    const { instance } = await render('#missing');
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const event = clickEvent();

    instance.onClick(event);

    expect(event.defaultPrevented).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('leaves the click alone when the anchor has no hash', async () => {
    const { instance } = await render('/other-page');
    const spy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const event = clickEvent();

    instance.onClick(event);

    expect(event.defaultPrevented).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });
});
