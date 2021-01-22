/**
 * Save the current active element.
 */
export function saveActiveElement(): void;
/**
 * Trap tab navigation inside the given element.
 * @param {HTMLElement} element The element in which to trap the tabulations.
 * @param {KeyboardEvent} event The keydown or keyup event.
 */
export function trap(element: HTMLElement, event: KeyboardEvent): void;
/**
 * Untrap the tab navigation.
 */
export function untrap(): void;
/**
 * Use a trap/untrap tabs logic.
 */
export default function useFocusTrap(): {
    trap: typeof trap;
    untrap: typeof untrap;
    saveActiveElement: typeof saveActiveElement;
};
