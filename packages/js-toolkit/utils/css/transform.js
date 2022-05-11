import isDefined from '../isDefined.js';

/**
 * @typedef {Partial<{
 *  x: number;
 *  y: number;
 *  z: number;
 *  rotate: number;
 *  rotateX: number;
 *  rotateY: number;
 *  rotateZ: number;
 *  scale: number;
 *  scaleX: number;
 *  scaleY: number;
 *  scaleZ: number;
 *  skew: number;
 *  skewX: number;
 *  skewY: number;
 * }>} TransformProps
 */

const translate =
  'translate3d(calc(var(--x, 0) * 1px), calc(var(--y, 0) * 1px), calc(var(--z, 0) * 1px))';
const generateDeg = (name) => `${name}(calc(var(--${name}, 0) * 1deg))`;
const generateScale = (name) => `${name}(var(--${name}, 1))`;

const parts = {
  x: translate,
  y: translate,
  z: translate,
  rotate: generateDeg('rotate'),
  rotateX: generateDeg('rotateX'),
  rotateY: generateDeg('rotateY'),
  rotateZ: generateDeg('rotateZ'),
  scale: generateScale('scale'),
  scaleX: generateScale('scaleX'),
  scaleY: generateScale('scaleY'),
  scaleZ: generateScale('scaleZ'),
  skew: generateDeg('skew'),
  skewX: generateDeg('skewX'),
  skewY: generateDeg('skewY'),
};

export const TRANSFORM_PROPS = Object.keys(parts)

/**
 * Generate a CSS transform.
 *
 * @param   {HTMLElement} element
 * @param   {TransformProps} props
 * @returns {string}
 */
export default function transform(element, props) {
  const value = new Set();
  Object.keys(props).forEach((name) => {
    // eslint-disable-next-line prefer-template
    element.style.setProperty('--' + name, props[name]);

    value.add(parts[name]);
  });

  element.style.transform = Array.from(value).join(' ');
  return element.style.transform;
}
