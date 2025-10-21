import { isFunction } from './is.js';
import { hasWindow } from './has.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (time?: DOMHighResTimeStamp) => any;

/**
 * Wait for the next frame to execute a function.
 * @link https://js-toolkit.studiometa.dev/utils/nextFrame.html
*/
export function nextFrame(): Promise<DOMHighResTimeStamp>;
export function nextFrame<T extends Callback>(callback?: T): Promise<ReturnType<T>>;
export function nextFrame<T extends Callback>(callback?: T): Promise<ReturnType<T>> {
  const fn = hasWindow() ? (window?.requestAnimationFrame ?? setTimeout) : setTimeout;
  return new Promise((resolve) => {
    fn((time) => resolve(isFunction(callback) ? callback(time) : time));
  });
}
