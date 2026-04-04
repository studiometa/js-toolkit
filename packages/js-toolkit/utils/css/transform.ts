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

  if (props.x !== undefined || props.y !== undefined || props.z !== undefined) {
    value += `translate3d(${props.x ?? 0}px, ${props.y ?? 0}px, ${props.z ?? 0}px) `;
  }

  if (props.rotate !== undefined) {
    value += `rotate(${props.rotate}deg) `;
  } else {
    if (props.rotateX !== undefined) {
      value += `rotateX(${props.rotateX}deg) `;
    }

    if (props.rotateY !== undefined) {
      value += `rotateY(${props.rotateY}deg) `;
    }

    if (props.rotateZ !== undefined) {
      value += `rotateZ(${props.rotateZ}deg) `;
    }
  }

  if (props.scale !== undefined) {
    value += `scale(${props.scale}) `;
  } else {
    if (props.scaleX !== undefined) {
      value += `scaleX(${props.scaleX}) `;
    }

    if (props.scaleY !== undefined) {
      value += `scaleY(${props.scaleY}) `;
    }

    if (props.scaleZ !== undefined) {
      value += `scaleZ(${props.scaleZ}) `;
    }
  }

  if (props.skew !== undefined) {
    value += `skew(${props.skew}deg) `;
  } else {
    if (props.skewX !== undefined) {
      value += `skewX(${props.skewX}deg) `;
    }

    if (props.skewY !== undefined) {
      value += `skewY(${props.skewY}deg) `;
    }
  }

  eachElements(elementOrElements, (element) => {
    element.style.transform = value;
  });
  return value;
}
