import keyCodes from './keyCodes';
var FOCUSABLE_ELEMENTS = ['a[href]:not([tabindex^="-"]):not([inert])', 'area[href]:not([tabindex^="-"]):not([inert])', 'input:not([disabled]):not([inert])', 'select:not([disabled]):not([inert])', 'textarea:not([disabled]):not([inert])', 'button:not([disabled]):not([inert])', 'iframe:not([tabindex^="-"]):not([inert])', 'audio:not([tabindex^="-"]):not([inert])', 'video:not([tabindex^="-"]):not([inert])', '[contenteditable]:not([tabindex^="-"]):not([inert])', '[tabindex]:not([tabindex^="-"]):not([inert])'];
/**
 * Use a trap/untrap tabs logic.
 *
 * @return {Object} An object containing the trap and untrap methods.
 */

export default function useFocusTrap() {
  var focusedBefore;
  /**
   * Save the current active element.
   *
   * @return {void}
   */

  function saveActiveElement() {
    focusedBefore = document.activeElement;
  }
  /**
   * Trap tab navigation inside the given element.
   *
   * @param  {HTMLElement} element The element in which to trap the tabulations.
   * @param  {KeyboardEvent}       event   The keydown or keyup event.
   * @return {void}
   */


  function trap(element, event) {
    if (event.keyCode !== keyCodes.TAB) {
      return;
    } // Save the previous focused element


    if (!focusedBefore) {
      focusedBefore = document.activeElement;
    }
    /** @type {Array<HTMLElement>} */


    var focusableChildren = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS.join(', ')));
    var focusedItemIndex = document.activeElement instanceof HTMLElement ? focusableChildren.indexOf(document.activeElement) : -1;

    if (!focusableChildren.length) {
      return;
    }

    if (focusedItemIndex < 0) {
      focusableChildren[0].focus();
      event.preventDefault();
    } // If the SHIFT key is being pressed while tabbing (moving backwards) and
    // the currently focused item is the first one, move the focus to the last
    // focusable item from the dialog element


    if (event.shiftKey && focusedItemIndex === 0) {
      focusableChildren[focusableChildren.length - 1].focus();
      event.preventDefault();
    } // If the SHIFT key is not being pressed (moving forwards) and the currently
    // focused item is the last one, move the focus to the first focusable item
    // from the dialog element
    else if (!event.shiftKey && focusedItemIndex === focusableChildren.length - 1) {
        focusableChildren[0].focus();
        event.preventDefault();
      }
  }
  /**
   * Untrap the tab navigation.
   *
   * @return {void}
   */


  function untrap() {
    if (focusedBefore && typeof focusedBefore.focus === 'function') {
      focusedBefore.focus();
      focusedBefore = null;
    }
  }

  return {
    trap: trap,
    untrap: untrap,
    saveActiveElement: saveActiveElement
  };
}
//# sourceMappingURL=focusTrap.js.map