/**
 * The two helpers a spec needs that `@studiometa/js-toolkit-v4/test` does not
 * ship, because neither belongs in a consumer's hands.
 *
 * `getInstance()` reads the raw instances map with no `$isMounted` filter,
 * which is what lets a spec inspect an instance before it mounts or after it
 * unmounts — precisely the window the public `getInstances()` hides.
 * `countRequestedFrames()` replaces a global.
 *
 * Everything else moved: `settle`, `frames`, `mount`, `waitFor`, `resetDom`
 * and the rest are in `src/test/index.ts`, and the todo component tree is in
 * `src/todo.fixtures.ts`.
 */

import { INSTANCES } from './protocol-symbols.js';
import type { Base } from './Base.js';

/** Count requested frames and always restore `requestAnimationFrame`. */
export async function countRequestedFrames(during: () => Promise<void> | void): Promise<number> {
  const original = globalThis.requestAnimationFrame;
  let requested = 0;
  globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
    requested += 1;
    return original.call(globalThis, callback);
  };
  try {
    await during();
  } finally {
    globalThis.requestAnimationFrame = original;
  }
  return requested;
}

export function getInstance<T extends Base = Base>(el: Element | null, name: string): T {
  return el?.[INSTANCES]?.get(name) as T;
}
