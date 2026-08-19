import {
  Base,
  component,
  getInstances,
  withResize,
  withScroll,
  type BaseProps,
  type ChildrenCollection,
  type DelegatedEvent,
  type ScrollProps,
} from '../../src/index.js';
import { Sentinel } from '../Sentinel/index.js';

export type StickyProps = BaseProps & {
  $refs: { inner: HTMLElement };
  $options: {
    zIndex: number;
    hideWhenUp: boolean;
    hideWhenDown: boolean;
  };
};

/**
 * A sticky-positioning primitive that stacks multiple sticky elements
 * without overlap. A child `Sentinel` detects when the element becomes
 * stuck, then each instance offsets and z-indexes itself against the others
 * sharing its positioning context. `hideWhenUp`/`hideWhenDown` hide on
 * scroll direction, and `zIndex` sets the base stacking order.
 *
 * @link https://ui.studiometa.dev/reference/items/Sticky/
 */
@component({
  name: 'Sticky',
  refs: ['inner'],
  components: { Sentinel },
  options: {
    zIndex: { type: Number, default: 100 },
    hideWhenUp: Boolean,
    hideWhenDown: Boolean,
  },
})
export class Sticky<T extends BaseProps = BaseProps> extends withResize(
  withScroll(Base),
)<StickyProps & T> {
  isSticky = false;

  isVisible = true;

  /**
   * Live collection rather than a constructed reference: a v4 mount carries
   * no ordering guarantee, so the sentinel this reads may not exist yet on
   * the first `mounted()` cycle. Measuring on `added` instead of on mount
   * covers the case a v3 `$children` read could not.
   */
  sentinels: ChildrenCollection<Sentinel> = this.$watchChildren<Sentinel>('Sentinel', {
    added: () => this.setSentinelSize(),
  });

  get sentinel(): Sentinel | undefined {
    return this.sentinels.items[0];
  }

  /**
   * Every mounted `Sticky` on the page, in DOM order. Replaces v3's
   * `static instances: Set<Sticky>` manually kept in sync from `mounted()`
   * and `destroyed()` — core's registry already answers this live.
   */
  get instances(): Sticky[] {
    return getInstances<Sticky>('Sticky');
  }

  set y(value: number) {
    this.$refs.inner.style.transform = `translateY(${value}px) translateZ(0px)`;
  }

  resized(): void {
    this.setSentinelSize();
  }

  scrolled(props: ScrollProps): void {
    if (!this.isSticky || props.deltaY === 0) {
      return;
    }

    if (
      (props.directionY === 1 && this.$options.hideWhenDown) ||
      (props.directionY === -1 && this.$options.hideWhenUp)
    ) {
      this.hide();
    } else {
      this.show();
    }
  }

  onSentinelIntersected({ payload }: DelegatedEvent<Sentinel, 'intersected'>): void {
    const { entry } = payload;
    this.isSticky = Boolean(entry && entry.isIntersecting && entry.boundingClientRect.y < 0);
    this.setPosition();
  }

  /** Hide the sticky component when another one is sticky. */
  hide(): void {
    if (!this.isVisible) {
      return;
    }

    this.isVisible = false;
    this.$el.classList.add('pointer-events-none');

    this.instances.forEach((instance, index) => instance.setPosition(index));
  }

  /** Show the sticky component when the other one is not sticky anymore. */
  show(): void {
    if (this.isVisible) {
      return;
    }

    this.isVisible = true;
    this.$el.classList.remove('pointer-events-none');

    this.instances.forEach((instance, index) => instance.setPosition(index));
  }

  /** Set the sentinel height based on the previous instances. */
  setSentinelSize(): void {
    const { instances, sentinel } = this;
    if (!sentinel) {
      return;
    }

    const index = instances.indexOf(this);
    const height = instances
      .slice(0, index)
      .filter((instance) => this.closestRelativeElement(instance.$el).contains(this.$el))
      .reduce((acc, instance) => acc + instance.$el.offsetHeight, 0);

    sentinel.$el.style.height = `${height + 1}px`;
    this.$el.style.top = `${height}px`;
    this.$el.style.zIndex = String(this.$options.zIndex - index);
  }

  /** Set the component's position. */
  setPosition(index?: number): void {
    if (!this.isSticky) {
      this.y = 0;
      return;
    }

    const { instances } = this;
    const at = index ?? instances.indexOf(this);

    this.y = instances
      .slice(0, at)
      .filter((instance) => instance.isSticky && !instance.isVisible)
      .reduce<number>(
        (y, instance) => y - instance.$refs.inner.offsetHeight,
        this.isVisible ? 0 : this.$refs.inner.offsetHeight * -1,
      );
  }

  /** Find the first parent which has a relative position. */
  closestRelativeElement(element: HTMLElement): HTMLElement {
    let parent = element.parentElement as HTMLElement;

    while (parent.parentElement && getComputedStyle(parent).position !== 'relative') {
      parent = parent.parentElement;
    }

    return parent;
  }
}
