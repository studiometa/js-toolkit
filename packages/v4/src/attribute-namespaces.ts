/**
 * The mechanism half of the attribute grammar: one namespace, watched on one
 * element, rebound whenever one of its attributes changes.
 *
 * `attributes.ts` owns the grammar — what a namespace is, where the colon goes,
 * and that a qualifier's parts belong to whoever declared the namespace. This
 * module owns the other half of the split: **core decides when to re-parse and
 * how the attribute is observed, and the caller decides what the string means.**
 *
 * Which mechanism a namespace gets follows from whether its whole set of names
 * is enumerable, not from whether its qualifier vocabulary is finite. A
 * declared option's names are `attribute × breakpoint` — finite, so they are
 * registered with the one document observer and no second observer exists. A
 * namespace whose names cannot be listed in advance is this module's case:
 * `data-on:<any DOM event>`, and `data-bind:class.<any class name>`, whose
 * qualifier head is finite while its tail is not. See DESIGN.md §3.
 */

import { namespaceQualifier, qualifierHead, QUALIFIER_SEPARATOR } from './attributes.js';
import { warnOnce } from './diagnostics.js';
import { watchAttributes } from './dom-mutations.js';

/** One declaration read off an element, as {@link watchAttributeNamespace} reports it. */
export interface AttributeNamespaceDeclaration {
  /** Everything after the colon: `click.prevent`, `prop.value`, `view.once`. */
  qualifier: string;
  /** The attribute's value. Never `null` — an absent attribute releases instead. */
  value: string;
  /** The whole attribute name, which is the key the binding is held under. */
  attribute: string;
}

/**
 * Build whatever one declaration means, and return its release. Returning
 * nothing says the declaration produced no binding — a malformed value, say —
 * and leaves nothing to release.
 */
export type AttributeNamespaceBinder = (
  declaration: AttributeNamespaceDeclaration,
) => (() => void) | void;

export interface AttributeNamespaceOptions {
  /**
   * The qualifier heads this namespace declares. Given, a head outside the set
   * warns once and binds nothing; omitted, the vocabulary is open and anything
   * binds. This is independent of the mechanism: a finite head does not make a
   * name enumerable, which is why `data-bind` is watched and validated at once.
   */
  qualifiers?: readonly string[];
  /** The component name carried by the warning, when there is one. */
  component?: string;
}

/**
 * Bind every `<namespace>:<qualifier>` attribute of one element, and keep the
 * bindings in step with the element.
 *
 * The declarations present now are bound on subscription; afterwards each
 * attribute of the namespace is its own binding, keyed by the name that
 * produced it, so one `#bind` covers all three shapes a change can take —
 * **added** attaches with nothing to release, **changed** releases then
 * attaches, **removed** releases with nothing to attach. This is what a
 * memoised parse cannot do, and rewriting an attribute in place is not
 * hypothetical: `swap({ mode: 'morph' })` does it, and so does any
 * `data-bind:` template around the element.
 *
 * @param el        The element whose attributes are read and watched.
 * @param namespace The namespace, without its colon: `data-on`, `data-track`.
 * @param bind      Called once per declaration; returns that binding's release.
 * @param options   An optional finite head vocabulary, and a component name.
 * @returns An idempotent cleanup releasing every binding and stopping the watch.
 */
export function watchAttributeNamespace(
  el: Element,
  namespace: string,
  bind: AttributeNamespaceBinder,
  { qualifiers, component }: AttributeNamespaceOptions = {},
): () => void {
  /** Live bindings by the attribute that produced them, each holding its release. */
  const bindings = new Map<string, () => void>();

  const rebind = (attribute: string, value: string | null): void => {
    // Release first, whatever comes next: a rewritten attribute must not leave
    // its previous binding attached, which is the whole point of watching.
    bindings.get(attribute)?.();
    const qualifier = namespaceQualifier(namespace, attribute);
    const release =
      value === null ||
      qualifier === null ||
      !isWellFormed(el, attribute, qualifier, component) ||
      !isDeclared(el, namespace, attribute, qualifier, qualifiers, component)
        ? undefined
        : bind({ qualifier, value, attribute });

    if (release) {
      // `set` on a key already there keeps its position, so the order the
      // element declares its bindings in survives a rewrite.
      bindings.set(attribute, release);
    } else {
      bindings.delete(attribute);
    }
  };

  for (const { name, value } of Array.from(el.attributes)) {
    rebind(name, value);
  }

  // The watcher covers every attribute of the element, framework names
  // included, so the namespace is what narrows it — and a removal keeps the
  // name it was declared under, so one test covers all three shapes.
  const stopWatchingAttributes = watchAttributes(el, ({ name, value }) => {
    if (namespaceQualifier(namespace, name) !== null) {
      rebind(name, value);
    }
  });

  return () => {
    stopWatchingAttributes();
    for (const release of bindings.values()) {
      release();
    }
    bindings.clear();
  };
}

/**
 * Whether a qualifier holds the grammar's one colon and no more, warning once
 * if not. `namespaceQualifier()` returns everything after the first colon
 * unexamined, so `data-on:click:s` reaches here as the qualifier `click:s` —
 * a second declaration's separator leaking into the first — and an open
 * namespace with no declared vocabulary would otherwise bind it as though
 * `click:s` were an event name instead of the ill-formed attribute J1 settled
 * it to be.
 */
function isWellFormed(
  el: Element,
  attribute: string,
  qualifier: string,
  component: string | undefined,
): boolean {
  if (!qualifier.includes(QUALIFIER_SEPARATOR)) {
    return true;
  }
  warnOnce(
    el,
    attribute,
    'attribute.unknown-qualifier',
    `\`${attribute}\` declares nothing: a qualifier holds one colon at most, and this one holds a second.`,
    { component, target: el },
  );
  return false;
}

/** Whether a qualifier names a member of the vocabulary, warning once if not. */
function isDeclared(
  el: Element,
  namespace: string,
  attribute: string,
  qualifier: string,
  qualifiers: readonly string[] | undefined,
  component: string | undefined,
): boolean {
  if (qualifiers === undefined) {
    return true;
  }
  const head = qualifierHead(qualifier);
  if (qualifiers.includes(head)) {
    return true;
  }
  warnOnce(
    el,
    attribute,
    'attribute.unknown-qualifier',
    `\`${attribute}\` declares nothing: \`${head}\` names no \`${namespace}\` binding — known names: ${qualifiers.join(', ')}.`,
    { component, target: el },
  );
  return false;
}
