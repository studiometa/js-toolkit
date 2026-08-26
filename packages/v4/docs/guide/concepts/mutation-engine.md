# The mutation engine

One internal engine owns **one** MutationObserver, for component discovery, lifecycle, mount strategies, ref invalidation and declared options.

[[toc]]

## What it watches

Its `attributeFilter` holds:

- the fixed framework attributes — `data-component`, `data-mount`, `data-ref`;
- the exact responsive `data-component:<breakpoint>` spellings of the configured breakpoints;
- the option names of every registered config, and the negated spelling of each boolean option, with one scoped spelling per breakpoint.

Writes to `class`, `style` and ARIA attributes create **no record**. That is the point of an exact filter: the attributes a page churns are not the attributes the framework reads.

**The `attributeFilter` and the relevance test of the engine are one set.** A record is relevant if and only if it names an attribute the observer holds. A change to that set drains the records of the previous filter first.

## The fixed order of a batch

The engine snapshots the membership of a removed subtree when the records enter its queue, then processes each batch in a fixed order:

1. **unmount** removed subtrees and dispose their strategies;
2. **reconcile** the final plain and scoped `data-component` attributes, and `data-mount`;
3. **deliver** coalesced declared-option changes to the mounted instances that stay;
4. **scan** added subtrees once and schedule their registered component tokens;
5. **report** coalesced attribute changes to the elements that asked to watch them.

Teardown before setup, and the elements that stay hear about their options before anything new is built. Step 5 is last, which is why a component that stops its watcher during the same batch in which its own declaration is withdrawn hears nothing about the attribute change.

## What each transition means

| Transition                                                | Effect                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| the element is **disconnected**                           | `$unmount()`, and the instance stays on its element for a later insertion |
| a component token is **removed** from a connected element | `$unmount()`, then the instance is dropped from the element               |
| a breakpoint **withdraws** a declaration                  | the same: unmount, then drop                                              |
| the node is **moved**                                     | one unmount and one mount cycle, same identity                            |

The token later declared again gives a **new** instance, because the DOM no longer declared that identity.

## Ref invalidation

Ref lookups are cached, and the cache is invalidated by a counter this observer increases. Reading that counter drains the pending records with `takeRecords()`, so a read is current even inside the same task as the mutation. Detached elements are never cached.

That is the whole implementation of "refs are live", and it is why there is no `$update()`.

## `whenDOMSettled()`

It is the completion boundary for morphing, fetch updates and breakpoint crossings. It:

- drains the pending records;
- follows the mutation chains of eager lifecycle work, so markup a `mounted()` inserts is covered too;
- resolves after the eager mounts and the teardown.

It does **not** wait for visibility, interaction, idle or media conditions, and it does **not** await the promises returned by `mounted()`. An eager lazy component _is_ covered: the import promise joins the lifecycle-work set for the eager trigger only.

## The lanes it runs in

Framework work runs through the scheduler's **background** lane: a 5 ms slice per turn, posted through `scheduler.postTask({ priority: 'background' })` with a `MessageChannel` fallback. Background work alone never requests an animation frame.

Breakpoint work runs there too, so `whenDOMSettled()` includes the teardown, import and mount work of a crossing.

See [The scheduler](/guide/going-further/scheduling-work.html).

## Watching something else

The engine sees only what it can name. Two opt-ins cover the rest, and both are described in [The attribute grammar](/guide/concepts/attribute-grammar.html):

- [`watchAttributes()`](/api/dom/watchAttributes.html) — every attribute of one element, through a second observer, with the records joining the same queue.
- [`watchAttributeNamespace()`](/api/dom/watchAttributeNamespace.html) — a namespace whose names cannot be enumerated, with keyed bindings and per-declaration teardown.

For a subtree, character data, or a node the framework does not know, [`useMutation()`](/api/services/useMutation.html) is a general `MutationObserver` as a service. It delivers on the platform's timing; a subscriber that needs the framework's order awaits `whenDOMSettled()` in its callback.
