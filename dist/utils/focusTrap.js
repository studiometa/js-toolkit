import keyCodes from './keyCodes';
var FOCUSABLE_ELEMENTS = ['a[href]:not([tabindex^="-"]):not([inert])', 'area[href]:not([tabindex^="-"]):not([inert])', 'input:not([disabled]):not([inert])', 'select:not([disabled]):not([inert])', 'textarea:not([disabled]):not([inert])', 'button:not([disabled]):not([inert])', 'iframe:not([tabindex^="-"]):not([inert])', 'audio:not([tabindex^="-"]):not([inert])', 'video:not([tabindex^="-"]):not([inert])', '[contenteditable]:not([tabindex^="-"]):not([inert])', '[tabindex]:not([tabindex^="-"]):not([inert])'];
var focusedBefore;
export function saveActiveElement() {
  focusedBefore = document.activeElement;
}
export function trap(element, event) {
  if (event.keyCode !== keyCodes.TAB) {
    return;
  }

  if (!focusedBefore) {
    focusedBefore = document.activeElement;
  }

  var focusableChildren = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
  var focusedItemIndex = document.activeElement instanceof HTMLElement ? focusableChildren.indexOf(document.activeElement) : -1;

  if (!focusableChildren.length) {
    return;
  }

  if (focusedItemIndex < 0) {
    focusableChildren[0].focus();
    event.preventDefault();
  }

  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren[focusableChildren.length - 1].focus();
    event.preventDefault();
  } else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
      focusableChildren[0].focus();
      event.preventDefault();
    }
}
export function untrap() {
  if (focusedBefore && typeof focusedBefore.focus === 'function') {
    focusedBefore.focus();
    focusedBefore = null;
  }
}
export default function useFocusTrap() {
  return {
    trap: trap,
    untrap: untrap,
    saveActiveElement: saveActiveElement
  };
}
//# sourceMappingURL=focusTrap.js.map