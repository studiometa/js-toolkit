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
// @twoslash-cache: {"v":1,"hash":"396193c27ff865d199027f84b0eb71c889f6eded56700d4a9ba2b0ed66ed8790","data":"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="}
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
