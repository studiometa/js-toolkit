import { getSharedRuntimeSlot } from '../shared-runtime.js';

/** What tab navigation can reach, in document order. */
const FOCUSABLE = [
  'a[href]:not([tabindex^="-"]):not([inert])',
  'area[href]:not([tabindex^="-"]):not([inert])',
  'input:not([disabled]):not([tabindex^="-"]):not([inert])',
  'select:not([disabled]):not([tabindex^="-"]):not([inert])',
  'textarea:not([disabled]):not([tabindex^="-"]):not([inert])',
  'button:not([disabled]):not([tabindex^="-"]):not([inert])',
  'iframe:not([tabindex^="-"]):not([inert])',
  'audio:not([tabindex^="-"]):not([inert])',
  'video:not([tabindex^="-"]):not([inert])',
  '[contenteditable]:not([tabindex^="-"]):not([inert])',
  '[tabindex]:not([tabindex^="-"]):not([inert])',
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
 */
export function saveActiveElement(): void {
  state.focusedBefore = document.activeElement;
}

/**
 * Keep tab navigation inside an element.
 */
export function trapFocus(el: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }

  state.focusedBefore ??= document.activeElement;

  const focusable = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)];
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
 */
export function untrapFocus(): void {
  if (state.focusedBefore instanceof HTMLElement) {
    state.focusedBefore.focus();
  }
  state.focusedBefore = null;
}
