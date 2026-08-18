import { getSharedRuntimeSlot } from '../shared-runtime.js';

/** What one target's lock knows: how many holders it has, and what to put back. */
interface Lock {
  holders: number;
  restore: string;
}

/**
 * One counter per locked element, shared across evaluated copies of the
 * package: there is one scroll per document, so two copies must count the same
 * holders or the second release puts the page back while a surface is still
 * open.
 */
const state = /* @__PURE__ */ getSharedRuntimeSlot('scroll-lock', 1, () => ({
  locks: new WeakMap<HTMLElement, Lock>(),
}));

/**
 * Stop an element scrolling until every holder releases it.
 *
 * A modal surface is not alone on the page: a dialog opened from inside a
 * drawer means two holders, and the one that closes first must not put the
 * scroll back under the one still open. Counting is the whole point — the
 * first lock saves the inline value it found, the last release puts exactly
 * that value back, and the ones in between only move the count.
 *
 * The release is idempotent, so a surface may call it on close and again on
 * destroy without counting twice.
 *
 * @param target What stops scrolling. Defaults to the document element.
 * @returns Release this holder's lock.
 *
 * @example
 * ```js
 * const release = lockScroll();
 * // …later, whichever comes first
 * release();
 * ```
 */
export function lockScroll(target: HTMLElement = document.documentElement): () => void {
  const lock = state.locks.get(target);

  if (lock) {
    lock.holders += 1;
  } else {
    // Save the inline value rather than assuming it was empty: a page may set
    // `overflow` for its own reasons, and it owns it again on the last release.
    state.locks.set(target, { holders: 1, restore: target.style.overflow });
    target.style.overflow = 'hidden';
  }

  let isReleased = false;

  return () => {
    if (isReleased) {
      return;
    }
    isReleased = true;

    const current = state.locks.get(target);
    if (!current) {
      return;
    }

    current.holders -= 1;
    if (current.holders > 0) {
      return;
    }

    state.locks.delete(target);
    target.style.overflow = current.restore;
  };
}
