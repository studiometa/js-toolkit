import { Base, component, type BaseProps, type ChildrenCollection } from '../../src/index.js';
import { AnchorNavLink } from './AnchorNavLink.js';
import { AnchorNavTarget } from './AnchorNavTarget.js';

export type AnchorNavProps = BaseProps;

/**
 * Coordinates `AnchorNavLink` children with their matching `AnchorNavTarget`
 * sections. v3 reacted to the target's `mounted`/`destroyed` lifecycle events
 * bubbling with their plain names; v4 dispatches those under a namespaced
 * event type instead (`js-toolkit:component:mounted`), so magic-name
 * delegation (`onAnchorNavTargetMounted`) cannot bind to them directly.
 * `$watchChildren`'s `added`/`removed` callbacks answer the same question —
 * they already fire exactly on a matching child's mount/unmount transitions.
 *
 * @link https://ui.studiometa.dev/reference/items/AnchorNav/
 */
@component({
  name: 'AnchorNav',
  components: { AnchorNavLink, AnchorNavTarget },
})
export class AnchorNav<T extends BaseProps = BaseProps> extends Base<AnchorNavProps & T> {
  links: ChildrenCollection<AnchorNavLink> = this.$watchChildren<AnchorNavLink>('AnchorNavLink');

  targets: ChildrenCollection<AnchorNavTarget> = this.$watchChildren<AnchorNavTarget>(
    'AnchorNavTarget',
    {
      added: (target) => this.#toggleLinksFor(target, 'enter'),
      removed: (target) => this.#toggleLinksFor(target, 'leave'),
    },
  );

  #toggleLinksFor(target: AnchorNavTarget, action: 'enter' | 'leave'): void {
    const { id } = target.$el;
    for (const link of this.links) {
      if (link.targetId === id) {
        void link[action]();
      }
    }
  }
}
