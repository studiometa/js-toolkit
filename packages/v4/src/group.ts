import { signal, type Signal } from './context.js';
import { compareDocumentOrder } from './document-order.js';

/**
 * What a group needs of a member: the element that decides its rank.
 *
 * Structural on purpose — this module never imports `Base`, so a group orders
 * anything anchored to the DOM and costs a consumer no component graph.
 */
export interface GroupMember {
  readonly $el: Element;
}

/**
 * A set of peers that know about each other, published as one reactive value.
 *
 * The membership _is_ the state. v3's `withGroup` handed out a bare `Set` with no
 * value cell, so a coordinator could read its peers but never learn that one
 * arrived, and every consumer built a change channel beside it. Here a peer
 * joining or leaving is an observable write, which is what makes an invariant
 * over the whole set — one open at a time, one selected item — enforceable
 * when v4 mounts on DOM insertion with no ordering guarantee.
 *
 * A group is not a registry: nothing joins implicitly, and the coordinator
 * that created the group decides who can reach it — usually by providing it as
 * a context value, so membership is scoped by the DOM, nearest provider first.
 */
export interface Group<T extends GroupMember = GroupMember> {
  /**
   * The members in document order, replaced by a new array on every change so
   * subscribers observe changes by identity and never share a mutable set.
   */
  readonly members: Signal<readonly T[]>;
  /**
   * Join, and get the leave function back.
   *
   * Returning the teardown is what makes membership survive an unknown mount
   * order: a member hands this straight back from a `subscribeContext()`
   * callback, so it joins the nearest group whenever that group appears, and
   * leaves again before a nearer one takes over.
   *
   * Membership is a set — joining twice changes nothing, and either leave
   * function removes the member once.
   */
  join(member: T): () => void;
}

/**
 * Create an empty group.
 *
 * A member leaves through the function `join()` returned; nothing sweeps
 * disconnected elements, because v4 destroys a component when its element
 * leaves the DOM and the member's own teardown is what removes it.
 */
export function createGroup<T extends GroupMember = GroupMember>(): Group<T> {
  const joined = new Set<T>();
  const members = signal<readonly T[]>([]);

  // Sorting on write keeps the published value ready to read and makes the
  // new array identity the notification.
  const publish = () => {
    members.value = [...joined].sort((a, b) => compareDocumentOrder(a.$el, b.$el));
  };

  return {
    members,
    join(member: T): () => void {
      if (!joined.has(member)) {
        joined.add(member);
        publish();
      }
      return () => {
        if (joined.delete(member)) {
          publish();
        }
      };
    },
  };
}
