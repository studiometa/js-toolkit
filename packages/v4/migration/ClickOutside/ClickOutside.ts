import { Base, type BaseConfig, type GlobalEvent } from '../../src/index.js';

/** Emits `click-outside` when a document click lands outside its element. */
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
