import { useFakeTimers, useRealTimers, advanceTimersByTimeAsync } from './faketimers.js';

/**
 * Resize the jsdom window to the given size.
 *
 * @param  {Object}  options
 * @param  {Number}  [options.width=window.innerHeight]  The new width.
 * @param  {Number}  [options.height=window.innerHeight] The new height.
 * @return {Promise}                A promise waiting longer than the debounced event from the resize service.
 */
export default async function resizeWindow({
  width = window.innerWidth,
  height = window.innerHeight,
} = {}) {
  useFakeTimers();
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
  await advanceTimersByTimeAsync(400);
  useRealTimers();
}
