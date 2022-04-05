/**
 * Get a `DOMRect` like `Object` for an element, without its transforms.
 * @param   {HTMLElement} element
 * @returns {{ x: number, y: number, width: number, height: number, top: number, right: number, bottom: number, left: number }}
 */
export default function getOffsetSizes(element) {
  let parent = element;
  let x = 0;
  let y = 0;

  while (parent) {
    x += parent.offsetLeft;
    y += parent.offsetTop;
    // @ts-ignore
    parent = parent.offsetParent;
  }

  const width = element.offsetWidth;
  const height = element.offsetWidth;

  return {
    x,
    y,
    width,
    height,
    top: y,
    right: width + x,
    bottom: height + y,
    left: x,
  };
}
