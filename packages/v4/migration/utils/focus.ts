/**
 * `trapFocus` / `untrapFocus` / `saveActiveElement`, ported from
 * `@studiometa/js-toolkit/utils/trapFocus`.
 *
 * The one change is the key test: v3 reads `event.keyCode`, deprecated since
 * 2016 and the reason the toolkit ships a `keyCodes` table. `event.key` needs
 * no table.
 */

const FOCUSABLE = [
  'a[href]:not([tabindex^="-"]):not([inert])',
  'area[href]:not([tabindex^="-"]):not([inert])',
  'input:not([disabled]):not([inert])',
  'select:not([disabled]):not([inert])',
  'textarea:not([disabled]):not([inert])',
  'button:not([disabled]):not([inert])',
  'iframe:not([tabindex^="-"]):not([inert])',
  'audio:not([tabindex^="-"]):not([inert])',
  'video:not([tabindex^="-"]):not([inert])',
  '[contenteditable]:not([tabindex^="-"]):not([inert])',
  '[tabindex]:not([tabindex^="-"]):not([inert])',
].join(', ');

let focusedBefore: Element | null = null;

/**
 * Remember what had the focus, to restore it later.
 */
export function saveActiveElement(): void {
  focusedBefore = document.activeElement;
}

/**
 * Keep tab navigation inside an element.
 */
export function trapFocus(el: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'Tab') {
    return;
  }

  focusedBefore ??= document.activeElement;

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
  if (focusedBefore instanceof HTMLElement) {
    focusedBefore.focus();
  }
  focusedBefore = null;
}
