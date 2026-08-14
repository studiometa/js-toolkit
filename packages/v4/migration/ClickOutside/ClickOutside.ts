import { Base, type BaseConfig, type GlobalEvent } from '../../src/index.js';

/**
 * ClickOutside — reports the clicks that land outside its own element.
 *
 * Port of @studiometa/ui 1.10's `ClickOutside`, and the reason REPORT.md gap
 * 15 was worth closing: the component is nothing but an `onDocumentClick`, so
 * without the primitive there is no v4 form of it at all — not a costlier
 * one, none. Delegation cannot substitute, because the event it exists to
 * hear is by definition the one that never reaches the component.
 *
 * Ported as the smallest thing that proves the primitive, so the ui original's
 * docs, exports and playground are left out; the body is the same body.
 *
 * | change | forced by |
 * | --- | --- |
 * | `onDocumentClick({ event }: BaseEventHookParams<MouseEvent>)` → `GlobalEvent<MouseEvent>` | v4's payload shape — the same destructuring, a different type name |
 * | a hand-built `new CustomEvent('click-outside', { detail: { event } })` → `$emit()` | v4's `$emit` carries one payload object as the `detail` verbatim, so the dispatch a v3 component had to write by hand *is* `$emit` now — and it bubbles and is cancelable, which the v3 one was not |
 *
 * The second line is the one worth reading: because the announcement bubbles,
 * an ancestor can pick it up as `on<Child>ClickOutside()` instead of adding a
 * listener to the element, which is what v4 asks a parent to do.
 *
 *     <div data-component="Dropdown">
 *       <div data-component="ClickOutside">…</div>
 *     </div>
 *
 *     class Dropdown extends Base {
 *       static config = { name: 'Dropdown', components: { ClickOutside } };
 *       onClickOutsideClickOutside() { this.close(); }
 *     }
 */
export class ClickOutside extends Base<{
  $emits: { 'click-outside': { event: MouseEvent } };
}> {
  static config: BaseConfig = {
    name: 'ClickOutside',
  };

  /**
   * `composedPath()` rather than `$el.contains(event.target)`: it is the one
   * that answers correctly for a click inside a shadow root, and for a target
   * the click removed from the DOM before the document heard about it.
   */
  onDocumentClick({ event }: GlobalEvent<MouseEvent>): void {
    if (!event.composedPath().includes(this.$el)) {
      this.$emit('click-outside', { event });
    }
  }
}
