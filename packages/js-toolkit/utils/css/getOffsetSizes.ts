/**
 * Get a `DOMRect` like `Object` for an element, without its transforms.
 */
export function getOffsetSizes(element: HTMLElement) {
  let parent = element;
  let x = -window.scrollX;
  let y = -window.scrollY;

  while (parent) {
    x += parent.offsetLeft;
    y += parent.offsetTop;
    // @ts-ignore
    parent = parent.offsetParent;
  }

  const width = element.offsetWidth;
  const height = element.offsetHeight;

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
