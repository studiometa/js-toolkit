import {
  Base,
  component,
  withKey,
  type BaseProps,
  type ChildrenCollection,
  type DelegatedEvent,
  type GlobalEvent,
  type KeyProps,
} from '../../src/index.js';
import { defaultScheduler } from '../../src/scheduler.js';
import { MenuBtn } from './MenuBtn.js';
import { MenuList } from './MenuList.js';

export type MenuProps = BaseProps & {
  $options: { mode: 'click' | 'hover' };
};

/**
 * A disclosure menu orchestrating a `MenuBtn` toggle button and a
 * collapsible `MenuList`. The `mode` option chooses whether it opens on
 * click or on hover, and it wires up ARIA attributes, keyboard handling
 * (Enter/Escape), click-outside dismissal and mutual closing of sibling
 * submenus.
 *
 * `menuBtn`/`menuList` filter their `$watchChildren` collections down to
 * the child whose nearest `Menu` ancestor is this one — `$closest('Menu')`
 * replaces v3's `getClosestParent(target, this.constructor)`, since a
 * nested submenu's own button/list would otherwise match too.
 *
 * v3 destroyed itself in `mounted()` when either child was missing; v4
 * gives no ordering guarantee for when a child mounts relative to its
 * parent, so `$watchChildren`'s `added` callback — not `mounted()` — is
 * where the button and list are wired up, and a `Menu` with no list is
 * simply inert rather than a hard failure.
 *
 * @link https://ui.studiometa.dev/reference/items/Menu/
 */
@component({
  name: 'Menu',
  components: { MenuBtn, MenuList },
  options: { mode: { type: String, default: 'click' } },
})
export class Menu<T extends BaseProps = BaseProps> extends withKey(Base)<MenuProps & T> {
  menuBtns: ChildrenCollection<MenuBtn> = this.$watchChildren<MenuBtn>('MenuBtn', {
    added: (btn) => {
      if (btn.$closest('Menu') === this) {
        btn.$el.setAttribute('aria-controls', this.$id);
      }
    },
  });

  menuLists: ChildrenCollection<MenuList> = this.$watchChildren<MenuList>('MenuList', {
    added: (list) => {
      if (list.$closest('Menu') === this) {
        list.$el.setAttribute('id', this.$id);
        list.close();
      }
    },
  });

  /** The `MenuBtn` this `Menu` owns, a nested submenu's own button excluded. */
  get menuBtn(): MenuBtn | undefined {
    return this.menuBtns.items.find((btn) => btn.$closest('Menu') === this);
  }

  /** The `MenuList` this `Menu` owns, a nested submenu's own list excluded. */
  get menuList(): MenuList | undefined {
    return this.menuLists.items.find((list) => list.$closest('Menu') === this);
  }

  get shouldReactOnClick(): boolean {
    return this.$options.mode === 'click';
  }

  get isHover(): boolean {
    return Boolean(this.menuBtn?.isHover || this.menuList?.isHover);
  }

  keyed({ ENTER, ESC, isUp }: KeyProps): void {
    if (!isUp) {
      return;
    }

    if (ESC) {
      this.close();
      return;
    }

    if (!this.shouldReactOnClick && ENTER && document.activeElement === this.menuBtn?.$el) {
      this.toggle();
    }
  }

  onDocumentClick({ event }: GlobalEvent<MouseEvent>): void {
    if (this.shouldReactOnClick && !this.$el.contains(event.target as Node)) {
      this.close();
    }
  }

  onMenuBtnClick({ event, target }: DelegatedEvent<MenuBtn>): void {
    if (!this.shouldReactOnClick || target.$closest('Menu') !== this) {
      return;
    }
    event.preventDefault();
    this.toggle();
  }

  onMenuBtnMouseenter({ target }: DelegatedEvent<MenuBtn>): void {
    if (target === this.menuBtn && !this.shouldReactOnClick) {
      this.open();
    }
  }

  onMenuBtnMouseleave(): void {
    this.#closeIfNotHoveredOnNextTurn();
  }

  onMenuListMouseleave(): void {
    this.#closeIfNotHoveredOnNextTurn();
  }

  onMenuListItemsOpen({ target }: DelegatedEvent<MenuList>): void {
    for (const list of this.menuLists) {
      if (!list.$el.contains(target.$el)) {
        list.close();
      }
    }
  }

  close(): void {
    this.menuList?.close();
  }

  open(): void {
    this.menuList?.open();
  }

  toggle(): void {
    void this.menuList?.toggle();
  }

  #closeIfNotHoveredOnNextTurn(): void {
    if (this.shouldReactOnClick) {
      return;
    }

    defaultScheduler.background(() => {
      if (this.$isMounted && !this.isHover) {
        this.close();
      }
    });
  }
}
