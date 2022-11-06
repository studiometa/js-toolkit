/**
 * Get a `DOMRect` like `Object` for an element, without its transforms.
 */
export default function getOffsetSizes(element: HTMLElement) {
  let parent = element;
  let x = -window.pageXOffset;
  let y = -window.pageYOffset;

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
