import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Toast } from './Toast.js';
import { Toaster } from './Toaster.js';

registerComponents(Toaster, Toast);

afterEach(resetDom);

/**
 * `viewTransition()` chains onto a module-level tail the scheduler does not
 * track — `settle()` gives no guarantee the DOM mutation inside it has run —
 * and a real headless compositor can take longer than usual to finish one.
 * Poll instead of trusting a fixed wait.
 */
async function waitFor(predicate: () => boolean, timeout = 1000): Promise<void> {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error('waitFor: timed out');
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function render(): Promise<{ root: HTMLElement; instance: Toaster }> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Toaster" data-option-duration="3">
      <div data-ref="polite"></div>
      <div data-ref="assertive"></div>
      <template data-ref="template">
        <div>
          <span data-message></span>
          <button data-ref="close">Close</button>
        </div>
      </template>
    </div>`;
  document.body.append(root);
  await settle();
  return {
    root,
    instance: getInstance<Toaster>(root.querySelector('[data-component="Toaster"]'), 'Toaster'),
  };
}

describe('Toaster', () => {
  it('inserts a Toast into the polite region by default, with the message and duration', async () => {
    const { root, instance } = await render();

    const toast = instance.show('Hello');
    const polite = root.querySelector('[data-ref="polite"]') as HTMLElement;
    await waitFor(() => polite.contains(toast));
    await settle();

    expect(toast.dataset.type).toBe('info');
    expect(toast.dataset.optionDelay).toBe('3');
    expect(toast.querySelector('[data-message]')?.textContent).toBe('Hello');
    expect(getInstance<Toast>(toast, 'Toast')).toBeTruthy();
  });

  it('routes an error toast to the assertive region', async () => {
    const { root, instance } = await render();

    const toast = instance.show('Oops', { type: 'error' });
    const assertive = root.querySelector('[data-ref="assertive"]') as HTMLElement;
    await waitFor(() => assertive.contains(toast));

    expect(toast.dataset.type).toBe('error');
  });

  it('disables autostart instead of setting a delay for a sticky (duration 0) toast', async () => {
    const { root, instance } = await render();

    const toast = instance.show('Sticky', { duration: 0 });
    const polite = root.querySelector('[data-ref="polite"]') as HTMLElement;
    await waitFor(() => polite.contains(toast));
    await settle();

    expect(toast.dataset.optionDelay).toBeUndefined();
    // A boolean option's presence is its value regardless of the string
    // written: the negated attribute name is what actually turns it off.
    expect(toast.hasAttribute('data-option-no-autostart')).toBe(true);

    const toastInstance = getInstance<Toast>(toast, 'Toast');
    expect(toastInstance.timerId).toBeNull();
  });

  it('emits show with the toast, message and type', async () => {
    const { root, instance } = await render();
    const events: Array<{ toast: HTMLElement; message: string; type: string }> = [];
    root
      .querySelector('[data-component="Toaster"]')!
      .addEventListener('show', (event) => {
        events.push((event as CustomEvent).detail);
      });

    const toast = instance.show('Hi', { type: 'success' });

    expect(events).toEqual([{ toast, message: 'Hi', type: 'success' }]);
  });

  it('assigns each toast a unique view-transition-name', async () => {
    const { instance } = await render();

    const first = instance.show('One');
    const second = instance.show('Two');

    expect(first.style.getPropertyValue('view-transition-name')).not.toBe(
      second.style.getPropertyValue('view-transition-name'),
    );
  });
});
