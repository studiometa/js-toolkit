# createGroup

```ts
createGroup<T extends GroupMember = GroupMember>(): Group<T>
```

A membership set whose members list is a reactive value.

```ts
interface Group<T extends GroupMember = GroupMember> {
  readonly members: Signal<readonly T[]>;
  join(member: T): () => void;
}
```

A `GroupMember` is anything with a `readonly $el: Element` — which every `Base` instance is.

## Usage

The coordinator owns the membership and gives out the ways in:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"396193c27ff865d199027f84b0eb71c889f6eded56700d4a9ba2b0ed66ed8790","data":"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"}
import { Base, createContext, createGroup, type Signal } from '@studiometa/js-toolkit-v4';

interface GroupApi {
  members: Signal<readonly Base[]>;
  join(peer: Base): () => void;
  open(peer: Base): void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class DisclosureGroup extends Base {
  static config = { name: 'DisclosureGroup' };

  #peers = createGroup<Base>();

  api = this.$provide(DisclosureGroupContext, {
    members: this.#peers.members, // the members to read, in document order
    join: (peer: Base) => this.#peers.join(peer), // returns the leave function
    open: (peer: Base) => this.open(peer), // the invariant stays here
  });

  mounted() {
    // The membership is a value: re-check the invariant on each change.
    return this.#peers.members.subscribe((members) => this.enforce(members));
  }

  open(peer: Base) {}

  enforce(members: readonly Base[]) {}
}
```

A member joins the nearest group whenever that group appears — see [`subscribeContext()`](./subscribeContext.html).

## What it does, and what it does not

- **`join()` returns its own `leave`**, so a member that moves to a nearer group leaves the old one first.
- **The membership is a value.** A coordinator subscribes to it and re-checks its invariant on each change, rather than being called back on a mutation.
- **Document order is the tie-breaker**, so the markup decides which peer keeps its state.
- **Nothing sweeps disconnected members.** The teardown of the member removes it.
- **It names no group and resolves no scope.** Scope comes from nearest-provider-wins, so a nested group takes its own members only.

The helper holds a `Set` and a [`Signal`](./signal.html), and nothing else. That is the whole implementation.

## It replaces `withGroup`

`withGroup` is not ported. A group is a provided value now, so its scope is the provider's subtree rather than a name in a global table — and a nested group is a nested provider, with nothing to configure.
