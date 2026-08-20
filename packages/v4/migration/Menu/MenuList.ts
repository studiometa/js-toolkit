import {
  Base,
  getInstances,
  type BaseConfig,
  type BaseProps,
  type ChildrenCollection,
} from '../../src/index.js';
import { TRANSITION_OPTIONS, type TransitionOptions } from '../../src/utils/transition.js';
import { withTransition, type TransitionProps } from '../Transition/index.js';

const FOCUSABLE_ELEMENTS = [
  'a[href]:not([inert])',
  'area[href]:not([inert])',
  'input:not([disabled]):not([inert])',
  'select:not([disabled]):not([inert])',
  'textarea:not([disabled]):not([inert])',
  'button:not([disabled]):not([inert])',
  'iframe:not([inert])',
  'audio:not([inert])',
  'video:not([inert])',
  '[contenteditable]:not([inert])',
  '[tabindex]:not([inert])',
].join(',');

export type MenuListProps = BaseProps &
  TransitionProps & {
    $emits: TransitionProps['$emits'] & {
      'items-open': void;
      'items-close': void;
    };
  };

/** The nearest `MenuList` instance at or above `el`, or `null`. */
function closestMenuList(el: Element | null): MenuList | null {
  let node = el;
  while (node) {
    const instance = getInstances<MenuList>(node).find((i) => i.$config.name === 'MenuList');
    if (instance) {
      return instance;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * The collapsible list child of a `Menu`. It mixes in `withTransition` to
 * animate its reveal, exposes `open()`, `close()` and `toggle()`, keeps
 * `aria-hidden` and the `tabindex` of its focusable elements in sync with
 * its visibility, recursively closes nested lists, and emits
 * `items-open`/`items-close`.
 *
 * A menu left open must stay visible, so `enterKeep`/`leaveKeep` are forced
 * rather than read from the markup. v3 forced them by overriding the
 * `$options` getter, which v4 refuses — `$options` is a read-only view over
 * attributes with no override point — so the override lands on
 * `transitionOptions`, the declaration the mixin reads.
 *
 * @link https://ui.studiometa.dev/reference/items/Menu/
 */
export class MenuList<T extends BaseProps = BaseProps> extends withTransition(Base)<
  MenuListProps & T
> {
  static config: BaseConfig = {
    name: 'MenuList',
    options: { ...TRANSITION_OPTIONS },
    components: { MenuList },
  };

  isOpen = false;

  isHover = false;

  #lists: ChildrenCollection<MenuList> = this.$watchChildren<MenuList>('MenuList');

  /** Keep both end states, whatever the markup asked for. */
  get transitionOptions(): TransitionOptions {
    return { ...super.transitionOptions, enterKeep: true, leaveKeep: true };
  }

  mounted(): void {
    this.#updateTabIndexes('close');
  }

  onMouseenter(): void {
    this.isHover = true;
  }

  onMouseleave(): void {
    this.isHover = false;
  }

  /** Display the menu items. */
  open(): void {
    if (this.isOpen) {
      return;
    }

    this.#updateTabIndexes('open');
    this.$el.setAttribute('aria-hidden', 'false');
    this.isOpen = true;
    void this.enter();
    this.$emit('items-open');
  }

  /** Hide the menu items. */
  close(): void {
    if (!this.isOpen) {
      return;
    }

    for (const list of this.#lists) {
      list.close();
    }

    if (
      document.activeElement instanceof HTMLElement &&
      this.$el.contains(document.activeElement)
    ) {
      document.activeElement.blur();
    }

    this.$el.setAttribute('aria-hidden', 'true');
    this.#updateTabIndexes('close');
    this.isOpen = false;
    void this.leave();
    this.$emit('items-close');
  }

  toggle(): Promise<void> {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
    return Promise.resolve();
  }

  /** Set the `tabindex` of this list's own focusable elements, nested lists excluded. */
  #updateTabIndexes(mode: 'open' | 'close' = 'open'): void {
    for (const item of this.$el.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)) {
      if (closestMenuList(item.parentElement) !== this) {
        continue;
      }
      if (mode === 'close') {
        item.setAttribute('tabindex', '-1');
      } else {
        item.removeAttribute('tabindex');
      }
    }
  }
}
