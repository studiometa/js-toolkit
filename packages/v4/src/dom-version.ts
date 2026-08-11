let version = 0;
let observer: MutationObserver | null = null;

/**
 * A counter bumped whenever the document's structure changes, so a cached
 * DOM lookup knows when it went stale.
 *
 * The observer here is deliberately separate from the registry's: reading
 * the version drains the pending records with `takeRecords()`, which is
 * what makes a cache correct *within the same task* — a script that
 * replaces some markup and reads a ref on the next line must not be served
 * the old answer, and a MutationObserver callback would not have run yet.
 * Draining the registry's own queue would cost it those mutations.
 */
export function domVersion(): number {
  if (!observer) {
    observer = new MutationObserver(() => {
      version += 1;
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      // Only the attributes that change what a lookup would return.
      attributeFilter: ['data-ref', 'data-component'],
    });
  }
  if (observer.takeRecords().length > 0) {
    version += 1;
  }
  return version;
}
