/**
 * Script re-execution for content injected through `innerHTML`-style paths.
 *
 * Core owns this logic already — `swap()` recreates newly inserted scripts the
 * same way — but it keeps it module-private, and `swap()`'s own DOM semantics
 * do not match what `Fetch` does with an id-matched element (see `Fetch.ts`).
 * So the two helpers are copied from v3 verbatim.
 */

/** Recreate every script that was not already present, so it runs once. */
export function adoptNewScripts(
  newScripts: Set<HTMLScriptElement>,
  oldScripts: Set<HTMLScriptElement>,
): void {
  for (const script of newScripts) {
    if (oldScripts.has(script)) {
      continue;
    }
    adoptNewScript(script);
  }
}

/** Replace one parser-inert script node with an equivalent, executable one. */
export function adoptNewScript(script: HTMLScriptElement): void {
  const adopted = document.createElement('script');

  for (const attribute of script.getAttributeNames()) {
    adopted.setAttribute(attribute, script.getAttribute(attribute) as string);
  }

  if (script.textContent) {
    adopted.textContent = script.textContent;
  }

  script.replaceWith(adopted);
}

/** The scripts within an element, or the element itself when it is one. */
export function getScripts(el: HTMLElement): Set<HTMLScriptElement> {
  return el.tagName === 'SCRIPT'
    ? new Set([el as HTMLScriptElement])
    : new Set(el.querySelectorAll('script'));
}
