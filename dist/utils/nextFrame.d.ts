/**
 * Wait for the next frame to execute a function.
 *
 * @param  {Function=} [fn=() => {}] The callback function to execute.
 * @return {Promise} A Promise resolving when the next frame is reached.
 *
 * @example
 * ```js
 * nextFrame(() => console.log('hello world'));
 *
 * await nextFrame();
 * console.log('hello world');
 * ```
 */
export default function nextFrame(fn?: Function | undefined): Promise<any>;
export function getRaf(): Function;
