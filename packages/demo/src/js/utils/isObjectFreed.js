/**
 * Determines if an object is freed
 * @param obj is the object of interest
 * @param freeFn is a function that frees the object.
 * @returns a promise that resolves to {freed: boolean, memoryDiff:number}
 * @author Steve Hanov <steve.hanov@gmail.com>
 * @see http://stevehanov.ca/blog/?id=148
 */
export default function isObjectFreed(obj, freeFn) {
  return new Promise((resolve) => {
    if (!performance.memory) {
      throw new Error('Browser not supported.');
    }

    const initial = performance.memory.usedJSHeapSize;

    // When obj is GC'd, the large array will also be GCd and the impact will
    // be noticeable.
    const allocSize = 1024 * 1024 * 1024;
    // eslint-disable-next-line no-unused-vars
    const wm = new WeakMap([[obj, new Uint8Array(allocSize)]]);

    // wait for memory counter to update
    setTimeout(() => {
      const before = performance.memory.usedJSHeapSize;

      // Free the memory
      freeFn();

      const log = () => {
        const diff = before - performance.memory.usedJSHeapSize;
        console.log({
          initial,
          before,
          now: performance.memory.usedJSHeapSize,
          diff,
          freed: diff >= allocSize,
          memoryDiff: diff - allocSize,
        });
      };

      log();

      const interval = setInterval(log, 1000);

      // wait for GC to run, at least 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        log();
        resolve();
      }, 10000);
    }, 100);
  });
}
