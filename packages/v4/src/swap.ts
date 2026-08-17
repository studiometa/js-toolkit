import morphdom from 'morphdom';
import { warn } from './diagnostics.js';
import { whenDOMSettled } from './dom-mutations.js';

/** Named content swap modes. */
export const SWAP_MODES = {
  REPLACE: 'replace',
  PREPEND: 'prepend',
  APPEND: 'append',
  MORPH: 'morph',
} as const;

/** One of {@link SWAP_MODES}. */
export type SwapMode = (typeof SWAP_MODES)[keyof typeof SWAP_MODES];

/**
 * Content for the target. Strings use the target's parsing context; nodes provide their children.
 *
 * With `self`, an `Element` is the replacement itself rather than a container:
 * that is the only way its own attributes reach the page.
 */
export type SwapContent = string | Element | DocumentFragment;

/** A wrapper that must invoke the swap mutation exactly once. */
export type SwapWrap = (mutate: () => void) => void | Promise<unknown>;

export interface SwapOptions {
  /** Defaults to {@link SWAP_MODES.REPLACE}. */
  mode?: SwapMode;
  /** Wrap the mutation. Without a wrapper it runs synchronously. */
  wrap?: SwapWrap;
  /**
   * Replace the target element itself, attributes included, instead of its
   * children. Only `replace` and `morph` can do that — `append` and `prepend`
   * add to the children by definition and warn when this is set.
   */
  self?: boolean;
}

/**
 * Swap an element's content and wait for observable component lifecycle work.
 *
 * @param target The element whose content changes. With `self`, the element itself.
 * @param content The new content.
 * @returns Resolves after eager lifecycle work. Conditional mount strategies are not awaited.
 */
export async function swap(
  target: Element,
  content: SwapContent,
  options: SwapOptions = {},
): Promise<void> {
  const { mode = SWAP_MODES.REPLACE, wrap, self = false } = options;
  const incoming = asContainer(target, content);
  const replacement = self ? replacementFor(content, incoming) : null;

  if (self && (mode === SWAP_MODES.APPEND || mode === SWAP_MODES.PREPEND)) {
    warn(
      'swap.self-ignored',
      `The "${mode}" mode adds to the target's children, so \`self\` was ignored.`,
      { target },
    );
  } else if (self && !replacement) {
    warn('swap.self-ignored', 'The content holds no element to replace the target with.', {
      target,
    });
  }

  // Track script identity so preserved scripts do not run again.
  const knownScripts = new Set(target.querySelectorAll('script'));

  const mutate = () => {
    // Whatever ends up in the document, so its new scripts run exactly once.
    let roots: Element[] = [target];

    switch (mode) {
      case SWAP_MODES.APPEND:
        target.append(...incoming.childNodes);
        break;
      case SWAP_MODES.PREPEND:
        target.prepend(...incoming.childNodes);
        break;
      case SWAP_MODES.MORPH:
        // `childrenOnly` preserves the target and its attributes; `self` is the
        // opposite ask, so the replacement morphs the target itself.
        roots = [
          replacement
            ? (morphdom(target, replacement) as Element)
            : (morphdom(target, incoming, { childrenOnly: true }) as Element),
        ];
        break;
      default:
        if (replacement) {
          roots = [replacement];
          target.replaceWith(replacement);
        } else {
          target.replaceChildren(...incoming.childNodes);
        }
    }

    for (const root of roots) {
      adoptScripts(root, knownScripts);
    }
  };

  if (wrap) {
    await wrap(mutate);
  } else {
    mutate();
  }

  await whenDOMSettled();
}

/** Parse strings in a shallow target clone to preserve context-sensitive elements. */
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
 * The element that takes the target's place. An `Element` content is that
 * element; anything else contributes its first top-level element.
 */
function replacementFor(content: SwapContent, incoming: Element): Element | null {
  return content instanceof Element ? content : incoming.firstElementChild;
}

/**
 * Recreate newly inserted scripts so parser-inert scripts run once. Preserved script nodes do not run again.
 */
function adoptScripts(root: Element, knownScripts: ReadonlySet<HTMLScriptElement>): void {
  // `self` can put a script in the document as the root rather than under one.
  const scripts = root instanceof HTMLScriptElement ? [root] : root.querySelectorAll('script');

  for (const script of scripts) {
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
