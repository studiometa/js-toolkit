import { Base, component, type BaseProps } from '../../src/index.js';
import { scrollTo } from '../../src/utils/scrollTo.js';

export type ScrollToProps = BaseProps & { $el: HTMLAnchorElement };

/**
 * Enhances an anchor so that clicking it smoothly scrolls to the element its
 * `href` hash points to, instead of jumping. Renamed from `AnchorScrollTo`.
 *
 * @link https://ui.studiometa.dev/reference/items/ScrollTo/
 */
@component({ name: 'ScrollTo' })
export class ScrollTo<T extends BaseProps = BaseProps> extends Base<ScrollToProps & T> {
  /** The target selector, read from the link's hash. */
  get targetSelector(): string {
    return this.$el.hash;
  }

  /**
   * v1 let `scrollTo()` throw for a missing target and left the click alone
   * in that case. v4's `scrollTo()` is a no-op on a target the document does
   * not contain rather than throwing, so the existence check moves here:
   * `preventDefault()` only once a target is confirmed.
   */
  onClick(event: MouseEvent): void {
    const { targetSelector } = this;
    const target = targetSelector ? document.querySelector(targetSelector) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    scrollTo(target);
  }
}
