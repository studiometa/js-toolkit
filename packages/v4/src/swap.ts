import morphdom from 'morphdom';
import { whenDOMSettled } from './dom-mutations.js';

/**
 * How incoming content joins the target's existing content.
 *
 * A frozen object plus a derived type, so the no-build-step audience gets the
 * same named constants a TypeScript union would only give the typed one.
 * `SWAP_MODES.MORPH` gives both.
 */
export const SWAP_MODES = {
  REPLACE: 'replace',
  PREPEND: 'prepend',
  APPEND: 'append',
  MORPH: 'morph',
} as const;

/**
 * One of {@link SWAP_MODES}. The literals still type-check, so
 * `{ mode: 'morph' }` is as valid as `{ mode: SWAP_MODES.MORPH }`.
 */
export type SwapMode = (typeof SWAP_MODES)[keyof typeof SWAP_MODES];

/**
 * Markup for the target's new content.
 *
 * A string is parsed in the target's own parsing context, so table rows, list
 * items and `<option>`s survive. An `Element` or a `DocumentFragment` is read
 * as the *incoming counterpart of the target*: its children become the
 * target's content, which is what both @studiometa/ui call sites already mean
 * when they pass the element matched from a fetched document.
 */
export type SwapContent = string | Element | DocumentFragment;

/**
 * A wrapper deciding *when* the swap's single mutation runs.
 *
 * It receives the mutation and must invoke it exactly once. Whether a
 * rejecting wrapper loses the update or falls back to applying it directly is
 * the business of whoever negotiated the wrapper, not of the swap.
 */
export type SwapWrap = (mutate: () => void) => void | Promise<unknown>;

export interface SwapOptions {
  /** Defaults to {@link SWAP_MODES.REPLACE}. */
  mode?: SwapMode;
  /**
   * The composition seam. Without it the mutation runs synchronously; with it
   * the mutation is handed over — to `viewTransition`, to a leave/enter
   * transition, to a negotiated `dom-update` runner.
   */
  wrap?: SwapWrap;
}

/**
 * Swap an element's content from markup, then wait for the framework to catch up.
 *
 * The DOM work is one mutation followed by one script-adoption pass, and that
 * pairing is the whole reason this is a primitive: an injected `<script>` is
 * inert until it is recreated, and recreating one that was already there runs
 * it twice. Everything else v3 needed around a swap is gone — the registry
 * mounts and destroys purely on DOM insertion and ejection, and `$refs`
 * re-read on access, so there is no `$update()` to call and no child to tear
 * down by hand.
 *
 * @param target  The element whose content is replaced. It is never itself
 *                replaced, so the caller's reference, its `id` and any
 *                component instance living on it survive the swap.
 * @param content The new content. See {@link SwapContent}.
 * @returns Resolved once the mutation has been applied *and* every lifecycle
 *          consequence core can observe has run — swapped-in components
 *          mounted, swapped-out components destroyed. Conditional mount
 *          strategies (visible, idle, interaction, media) are deliberately
 *          not awaited, exactly as `whenDOMSettled()` documents.
 */
export async function swap(
  target: Element,
  content: SwapContent,
  options: SwapOptions = {},
): Promise<void> {
  const { mode = SWAP_MODES.REPLACE, wrap } = options;
  const incoming = asContainer(target, content);
  // Identity, not markup: a `<script>` surviving a morph is the same node and
  // must stay silent, even when an identical one arrives elsewhere.
  const knownScripts = new Set(target.querySelectorAll('script'));

  const mutate = () => {
    switch (mode) {
      case SWAP_MODES.APPEND:
        target.append(...incoming.childNodes);
        break;
      case SWAP_MODES.PREPEND:
        target.prepend(...incoming.childNodes);
        break;
      case SWAP_MODES.MORPH:
        // `childrenOnly` keeps the promise made by the signature: the target
        // is the caller's element, and its own attributes are not the swap's
        // to rewrite — on a v4 element `data-component` or `data-mount` would
        // change component identity as a side effect of a content update.
        morphdom(target, incoming, { childrenOnly: true });
        break;
      default:
        target.replaceChildren(...incoming.childNodes);
    }
    adoptScripts(target, knownScripts);
  };

  if (wrap) {
    await wrap(mutate);
  } else {
    mutate();
  }

  await whenDOMSettled();
}

/**
 * Normalize content into the element standing in for the target.
 *
 * A string is parsed by a shallow clone of the target rather than a neutral
 * `<div>` or a `DOMParser` document: `<tr>` inside a `<tbody>`, `<li>` inside
 * a `<ul>` and `<option>` inside a `<select>` are dropped by any other
 * context. The clone is never inserted into the document, so it is invisible
 * to the registry's observer.
 */
function asContainer(target: Element, content: SwapContent): Element {
  if (content instanceof Element) {
    return content;
  }

  const container = target.cloneNode(false) as Element;
  if (typeof content === 'string') {
    container.innerHTML = content;
  } else {
    container.append(content);
  }
  return container;
}

/**
 * Recreate every `<script>` under `target` which was not there before the
 * mutation, so it executes exactly once.
 *
 * Scripts produced by the fragment parser are flagged "already started" by the
 * HTML specification and stay inert wherever they are moved; only a freshly
 * created element runs. Diffing on node identity is what keeps a script that
 * survived the mutation — an untouched sibling in append mode, a node
 * morphdom reused — from running a second time.
 *
 * `querySelectorAll` returns a static list, so replacing as we walk it is
 * safe. An inline script inserting further scripts while it runs is outside
 * that list and outside this pass, as it was in @studiometa/ui.
 */
function adoptScripts(target: Element, knownScripts: ReadonlySet<HTMLScriptElement>): void {
  for (const script of target.querySelectorAll('script')) {
    if (knownScripts.has(script)) {
      continue;
    }

    const adopted = script.ownerDocument.createElement('script');
    for (const name of script.getAttributeNames()) {
      adopted.setAttribute(name, script.getAttribute(name) as string);
    }
    if (script.textContent) {
      adopted.textContent = script.textContent;
    }
    script.replaceWith(adopted);
  }
}
