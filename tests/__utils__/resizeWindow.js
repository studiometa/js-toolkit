/**
 * Resize the jsdom window to the given size.
 *
 * @param  {Number}  width  The new width.
 * @param  {Number}  height The new height.
 * @return {Promise}        A promise waiting longer than the debounced event from the resize
 *                          service.
 */
export default function resizeWindow({
  width = window.innerWidth,
  height = window.innerHeight,
} = {}) {
  window.innerWidth = width;
  window.innerHeight = height;
  window.dispatchEvent(new Event('resize'));
  return new Promise(resolve => setTimeout(resolve, 400));
}
