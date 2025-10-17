import { isDefined } from '../is.js';
// eslint-disable-next-line import/extensions
import { eachElements } from './utils.js';

export type TransformProps = Partial<{
  x: number;
  y: number;
  z: number;
  rotate: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  skew: number;
  skewX: number;
  skewY: number;
}>;

export const TRANSFORM_PROPS = [
  'x',
  'y',
  'z',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'scaleZ',
  'skew',
  'skewX',
  'skewY',
];

/**
 * Generate a CSS transform.
 * @link https://js-toolkit.studiometa.dev/utils/css/transform.html
*/
export function transform(
  elementOrElements: HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>,
  props: TransformProps,
): string {
  if (!elementOrElements) return

  let value = '';

  if (isDefined(props.x) || isDefined(props.y) || isDefined(props.z)) {
    value += `translate3d(${props.x ?? 0}px, ${props.y ?? 0}px, ${props.z ?? 0}px) `;
  }

  if (isDefined(props.rotate)) {
    value += `rotate(${props.rotate}deg) `;
  } else {
    if (isDefined(props.rotateX)) {
      value += `rotateX(${props.rotateX}deg) `;
    }

    if (isDefined(props.rotateY)) {
      value += `rotateY(${props.rotateY}deg) `;
    }

    if (isDefined(props.rotateZ)) {
      value += `rotateZ(${props.rotateZ}deg) `;
    }
  }

  if (isDefined(props.scale)) {
    value += `scale(${props.scale}) `;
  } else {
    if (isDefined(props.scaleX)) {
      value += `scaleX(${props.scaleX}) `;
    }

    if (isDefined(props.scaleY)) {
      value += `scaleY(${props.scaleY}) `;
    }

    if (isDefined(props.scaleZ)) {
      value += `scaleZ(${props.scaleZ}) `;
    }
  }

  if (isDefined(props.skew)) {
    value += `skew(${props.skew}deg) `;
  } else {
    if (isDefined(props.skewX)) {
      value += `skewX(${props.skewX}deg) `;
    }

    if (isDefined(props.skewY)) {
      value += `skewY(${props.skewY}deg) `;
    }
  }

  eachElements(elementOrElements, (element) => {
    element.style.transform = value;
  });
  return value;
}
