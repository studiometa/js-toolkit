import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponent } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Transition } from '../Transition/Transition.js';
import { Dialog } from './Dialog.js';

registerComponent(Dialog);

afterEach(async () => {
  document.documentElement.style.overflow = '';
  await resetDom();
});

function render({ modal = true, withTransition = true } = {}): HTMLDialogElement {
  const el = document.createElement('dialog');
  el.setAttribute('data-component', 'Dialog');
  // A boolean is presence: `String(modal)` would read `true` either way.
  if (!modal) {
    el.setAttribute('data-option-no-modal', '');
  }
  el.innerHTML = `
    ${
      withTransition
        ? `<div data-component="Transition" data-option-enter-to="is-open" data-option-enter-keep="" data-option-leave-to="is-closed" data-option-leave-keep="">panel</div>`
        : ''
    }
    <button type="button" id="first">first</button>
    <button type="button" id="last">last</button>
  `;
  document.body.append(el);
  return el;
}

describe('Dialog', () => {
  it('opens and closes the native dialog', async () => {
    const el = render();
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');

    await dialog.open();
    expect(el.open).toBe(true);
    expect(document.documentElement.style.overflow).toBe('hidden');

    await dialog.close();
    expect(el.open).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('is a no-op when already in the requested state', async () => {
    const el = render();
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');

    await dialog.close();
    expect(el.open).toBe(false);
    await dialog.open();
    await dialog.open();
    expect(el.open).toBe(true);
  });

  it('runs the transition children on open and close', async () => {
    const el = render();
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');
    const panel = el.querySelector('[data-component="Transition"]') as HTMLElement;

    expect(dialog.transitions).toHaveLength(1);
    expect(getInstance(panel, 'Transition')).toBeInstanceOf(Transition);

    await dialog.open();
    expect(panel.classList.contains('is-open')).toBe(true);

    await dialog.close();
    expect(panel.classList.contains('is-open')).toBe(false);
    expect(panel.classList.contains('is-closed')).toBe(true);
  });

  it('picks up a transition child inserted after mount', async () => {
    const el = render({ withTransition: false });
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');
    expect(dialog.transitions).toHaveLength(0);

    const added = document.createElement('div');
    added.setAttribute('data-component', 'Transition');
    added.setAttribute('data-option-enter-to', 'is-open');
    added.setAttribute('data-option-enter-keep', '');
    el.prepend(added);
    await settle();

    expect(dialog.transitions).toHaveLength(1);
    await dialog.open();
    expect(added.classList.contains('is-open')).toBe(true);
  });

  it('closes through the component when Escape cancels the native dialog', async () => {
    const el = render();
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');
    const panel = el.querySelector('[data-component="Transition"]') as HTMLElement;

    await dialog.open();
    expect(el.open).toBe(true);

    const close = vi.spyOn(dialog, 'close');
    el.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(close).toHaveBeenCalledOnce();
    await close.mock.results[0].value;

    expect(el.open).toBe(false);
    expect(panel.classList.contains('is-closed')).toBe(true);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('traps the tab key on the non-modal path only', async () => {
    const el = render({ modal: false, withTransition: false });
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');
    await dialog.open();

    const last = el.querySelector('#last') as HTMLButtonElement;
    const first = el.querySelector('#first') as HTMLButtonElement;
    last.focus();
    expect(document.activeElement).toBe(last);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
    expect(document.activeElement).toBe(first);
  });

  it('releases the keydown listener on destroy', async () => {
    const el = render({ modal: false, withTransition: false });
    await settle();
    const dialog = getInstance<Dialog>(el, 'Dialog');
    await dialog.open();

    const last = el.querySelector('#last') as HTMLButtonElement;
    last.focus();
    dialog.$destroy();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true }));
    expect(document.activeElement).toBe(last);
  });
});

describe('Dialog — the page scroll', () => {
  it('keeps the page locked while a second dialog is still open', async () => {
    const first = render({ withTransition: false });
    const second = render({ withTransition: false });
    await settle();

    await getInstance<Dialog>(first, 'Dialog').open();
    await getInstance<Dialog>(second, 'Dialog').open();
    expect(document.documentElement.style.overflow).toBe('hidden');

    await getInstance<Dialog>(second, 'Dialog').close();

    // The first one is still open: the page is not its to give back.
    expect(document.documentElement.style.overflow).toBe('hidden');

    await getInstance<Dialog>(first, 'Dialog').close();
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('gives the scroll back when a dialog is destroyed while open', async () => {
    const el = render({ withTransition: false });
    await settle();
    await getInstance<Dialog>(el, 'Dialog').open();
    expect(document.documentElement.style.overflow).toBe('hidden');

    el.remove();
    await settle();

    expect(document.documentElement.style.overflow).toBe('');
  });
});
