import morphdom from 'morphdom';
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
 */
export type SwapContent = string | Element | DocumentFragment;

/** A wrapper that must invoke the swap mutation exactly once. */
export type SwapWrap = (mutate: () => void) => void | Promise<unknown>;

export interface SwapOptions {
  /** Defaults to {@link SWAP_MODES.REPLACE}. */
  mode?: SwapMode;
  /** Wrap the mutation. Without a wrapper it runs synchronously. */
  wrap?: SwapWrap;
}

/**
 * Swap an element's content and wait for observable component lifecycle work.
 *
 * @param target The element whose content changes. The target itself is not replaced.
 * @param content The new content.
 * @returns Resolves after eager lifecycle work. Conditional mount strategies are not awaited.
 */
export async function swap(
  target: Element,
  content: SwapContent,
  options: SwapOptions = {},
): Promise<void> {
  const { mode = SWAP_MODES.REPLACE, wrap } = options;
  const incoming = asContainer(target, content);
  // Track script identity so preserved scripts do not run again.
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
        // Preserve the target and its attributes.
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
 * Recreate newly inserted scripts so parser-inert scripts run once. Preserved script nodes do not run again.
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
