import { getSharedRuntimeSlot } from '../shared-runtime.js';

/** What tab navigation can reach, in document order, before the rendering check. */
const FOCUSABLE = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio:not([tabindex^="-"])',
  'video:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
].join(', ');

/**
 * What had the focus before the trap. There is one focus on the page, so
 * evaluated package copies must save and restore through the same slot.
 */
const state = /* @__PURE__ */ getSharedRuntimeSlot('focus', 1, () => ({
  focusedBefore: null as Element | null,
}));

/**
 * Remember what had the focus, to restore it later.
 * @link https://js-toolkit-v4.studiometa.dev/utils/focus.html#saveactiveelement
 */
export function saveActiveElement(): void {
  state.focusedBefore = document.activeElement;
}

/**
 * Keep tab navigation inside an element.
 * @link https://js-toolkit-v4.studiometa.dev/utils/focus.html#trapfocus
 */
export function trapFocus(el: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }

  state.focusedBefore ??= document.activeElement;

  // Tab navigation skips what is not rendered or is inert, so the list must too:
  // a hidden first or last candidate would hold the focus or let it escape.
  const focusable = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (element) =>
      element.checkVisibility({ visibilityProperty: true }) && !element.closest('[inert]'),
  );
  if (focusable.length === 0) {
    return;
  }

  const index =
    document.activeElement instanceof HTMLElement ? focusable.indexOf(document.activeElement) : -1;

  if (index < 0) {
    focusable[0].focus();
    event.preventDefault();
    return;
  }

  if (event.shiftKey && index === 0) {
    focusable.at(-1)?.focus();
    event.preventDefault();
  } else if (!event.shiftKey && index === focusable.length - 1) {
    focusable[0].focus();
    event.preventDefault();
  }
}

/**
 * Give the focus back to whatever had it before the trap.
 * @link https://js-toolkit-v4.studiometa.dev/utils/focus.html#untrapfocus
 */
export function untrapFocus(): void {
  if (state.focusedBefore instanceof HTMLElement) {
    state.focusedBefore.focus();
  }
  state.focusedBefore = null;
}
