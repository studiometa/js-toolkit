import {
  Base,
  getInstances,
  type BaseConfig,
  type BaseProps,
  type ChildrenCollection,
} from '../../src/index.js';
import { enterTransition, leaveTransition, type TransitionOptions } from '../../src/utils/transition.js';
import type { Transitionable } from '../Transition/index.js';

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

export type MenuListProps = BaseProps & {
  $options: Omit<TransitionOptions, 'enterKeep' | 'leaveKeep'>;
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
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
 * The collapsible list child of a `Menu`. It implements `Transitionable`
 * (the same contract `Dialog` fans its own children out to) to animate its
 * reveal, exposes `open()`, `close()` and `toggle()`, keeps `aria-hidden`
 * and the `tabindex` of its focusable elements in sync with its visibility,
 * recursively closes nested lists, and emits `items-open`/`items-close`.
 *
 * v3 extended a `withTransition`-mixed class and forced `enterKeep`/
 * `leaveKeep` to `true` by overriding the `$options` getter — a menu's open
 * state must stay visible, not revert once the transition ends. v4's
 * `$options` is a read-only own property with no override point, and its
 * ported `Transition` is a plain, non-generic `Base` subclass rather than a
 * mixin, so extending it here would fix `MenuList`'s own props to
 * `Transition`'s. Since every one of `Transition`'s methods is overridden
 * below anyway to force the two flags, implementing `Transitionable`
 * directly avoids both problems at once.
 *
 * @link https://ui.studiometa.dev/reference/items/Menu/
 */
export class MenuList<T extends BaseProps = BaseProps>
  extends Base<MenuListProps & T>
  implements Transitionable
{
  static config: BaseConfig = {
    name: 'MenuList',
    options: {
      enterFrom: String,
      enterActive: String,
      enterTo: String,
      leaveFrom: String,
      leaveActive: String,
      leaveTo: String,
    },
    components: { MenuList },
  };

  state: 'entering' | 'leaving' | null = null;

  isOpen = false;

  isHover = false;

  #lists: ChildrenCollection<MenuList> = this.$watchChildren<MenuList>('MenuList');

  mounted(): void {
    this.#updateTabIndexes('close');
  }

  onMouseenter(): void {
    this.isHover = true;
  }

  onMouseleave(): void {
    this.isHover = false;
  }

  async enter(): Promise<void> {
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    await enterTransition(this.$el, { ...this.$options, enterKeep: true, leaveKeep: true });
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    await leaveTransition(this.$el, { ...this.$options, enterKeep: true, leaveKeep: true });
    this.$emit('transition-leave-end');
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
