import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Toast } from './Toast.js';

registerComponents(Toast);

afterEach(resetDom);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * `viewTransition()` chains onto a module-level tail the scheduler does not
 * track: `defaultScheduler`'s write task that flushes it returns as soon as
 * `document.startViewTransition(...).finished` is *requested*, not once it
 * settles, so `settle()` gives no guarantee the DOM mutation inside it has
 * run yet. A real headless compositor can also take longer than usual to
 * finish one. Poll instead of trusting a fixed wait.
 */
async function waitFor(predicate: () => boolean, timeout = 1000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error('waitFor: timed out');
    }
    await wait(10);
  }
}

function renderUnmounted(attributes = ''): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Toast" ${attributes}>
      <button data-ref="close">Close</button>
    </div>`;
  document.body.append(root);
  return root.firstElementChild as HTMLElement;
}

async function render(attributes = ''): Promise<{ el: HTMLElement; instance: Toast }> {
  const el = renderUnmounted(attributes);
  await settle();
  return { el, instance: getInstance<Toast>(el, 'Toast') };
}

describe('Toast', () => {
  it('pauses on mouseenter/focusin and resumes on mouseleave/focusout', async () => {
    const { instance } = await render('data-option-delay="1"');

    instance.onMouseenter();
    expect(instance.paused).toBe(true);
    instance.onMouseleave();
    expect(instance.paused).toBe(false);

    instance.onFocusin();
    expect(instance.paused).toBe(true);
    instance.onFocusout();
    expect(instance.paused).toBe(false);
  });

  it('dismisses when the close control is activated, emitting dismiss and removing itself', async () => {
    const { el, instance } = await render('data-option-no-autostart');
    const events: HTMLElement[] = [];
    el.addEventListener('dismiss', (event) => {
      events.push((event as CustomEvent<{ el: HTMLElement }>).detail.el);
    });

    instance.onCloseClick();
    await waitFor(() => !el.isConnected);

    expect(events).toEqual([el]);
  });

  it('is idempotent: a second dismiss is a no-op', async () => {
    const { el, instance } = await render('data-option-no-autostart');
    const events: unknown[] = [];
    el.addEventListener('dismiss', () => events.push(1));

    instance.dismiss();
    instance.dismiss();
    await settle();

    expect(events).toEqual([1]);
  });

  it('auto-dismisses once the countdown completes', async () => {
    // Listener attached before mounting settles: `autostart` fires the
    // countdown synchronously during that first cycle, and a short delay
    // could complete before a listener added only afterwards ever saw it.
    const el = renderUnmounted('data-option-delay="0.02"');
    const events: unknown[] = [];
    el.addEventListener('dismiss', () => events.push(1));
    await settle();

    await waitFor(() => !el.isConnected);

    expect(events).toEqual([1]);
  });
});
