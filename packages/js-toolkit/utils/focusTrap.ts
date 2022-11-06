import keyCodes from './keyCodes.js';
import { isFunction } from './is.js';

const FOCUSABLE_ELEMENTS = [
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
];

let focusedBefore;

/**
 * Save the current active element.
 */
export function saveActiveElement() {
  focusedBefore = document.activeElement;
}

/**
 * Trap tab navigation inside the given element.
 * @param {HTMLElement} element The element in which to trap the tabulations.
 * @param {KeyboardEvent} event The keydown or keyup event.
 */
export function trap(element:HTMLElement, event:KeyboardEvent) {
  if (event.keyCode !== keyCodes.TAB) {
    return;
  }

  // Save the previous focused element
  if (!focusedBefore) {
    focusedBefore = document.activeElement;
  }

  const focusableChildren:HTMLElement[] = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
  const focusedItemIndex =
    document.activeElement instanceof HTMLElement
      ? focusableChildren.indexOf(document.activeElement)
      : -1;

  if (!focusableChildren.length) {
    return;
  }

  if (focusedItemIndex < 0) {
    focusableChildren[0].focus();
    event.preventDefault();
  }

  // If the SHIFT key is being pressed while tabbing (moving backwards) and
  // the currently focused item is the first one, move the focus to the last
  // focusable item from the dialog element
  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren.at(-1).focus();
    event.preventDefault();
  }

  // If the SHIFT key is not being pressed (moving forwards) and the currently
  // focused item is the last one, move the focus to the first focusable item
  // from the dialog element
  else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
    focusableChildren[0].focus();
    event.preventDefault();
  }
}

/**
 * Untrap the tab navigation.
 */
export function untrap() {
  if (focusedBefore && isFunction(focusedBefore.focus)) {
    focusedBefore.focus();
    focusedBefore = null;
  }
}

/**
 * Use a trap/untrap tabs logic.
 */
export default function useFocusTrap() {
  return { trap, untrap, saveActiveElement };
}
