/**
 * CSS transform strings. Both helpers are pure: they format a value and the
 * caller hands the write to the scheduler.
 */

export interface TransformProps {
  x?: number;
  y?: number;
  z?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  skew?: number;
  skewX?: number;
  skewY?: number;
}

/** The properties {@link transform} formats, for callers splitting a style patch. */
export const TRANSFORM_PROPS = /* @__PURE__ */ Object.freeze([
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
]) as readonly (keyof TransformProps)[];

/**
 * Format a CSS transform.
 *
 * The three axes of a translation are one `translate3d`, and the shorthand of
 * a rotation, a scale or a skew wins over its per-axis properties.
 *
 * @example
 * ```js
 * transform({ x: 100, scale: 0.5 });
 * // translate3d(100px, 0px, 0px) scale(0.5)
 * ```
 */
export function transform(props: TransformProps): string {
  const parts: string[] = [];

  if (props.x !== undefined || props.y !== undefined || props.z !== undefined) {
    parts.push(`translate3d(${props.x ?? 0}px, ${props.y ?? 0}px, ${props.z ?? 0}px)`);
  }

  if (props.rotate !== undefined) {
    parts.push(`rotate(${props.rotate}deg)`);
  } else {
    if (props.rotateX !== undefined) parts.push(`rotateX(${props.rotateX}deg)`);
    if (props.rotateY !== undefined) parts.push(`rotateY(${props.rotateY}deg)`);
    if (props.rotateZ !== undefined) parts.push(`rotateZ(${props.rotateZ}deg)`);
  }

  if (props.scale !== undefined) {
    parts.push(`scale(${props.scale})`);
  } else {
    if (props.scaleX !== undefined) parts.push(`scaleX(${props.scaleX})`);
    if (props.scaleY !== undefined) parts.push(`scaleY(${props.scaleY})`);
    if (props.scaleZ !== undefined) parts.push(`scaleZ(${props.scaleZ})`);
  }

  if (props.skew !== undefined) {
    parts.push(`skew(${props.skew}deg)`);
  } else {
    if (props.skewX !== undefined) parts.push(`skewX(${props.skewX}deg)`);
    if (props.skewY !== undefined) parts.push(`skewY(${props.skewY}deg)`);
  }

  return parts.join(' ');
}

export interface MatrixProps {
  /** The scale on the x axis. Defaults to `1`. */
  scaleX?: number;
  /** The scale on the y axis. Defaults to `1`. */
  scaleY?: number;
  /** The skew on the x axis. Defaults to `0`. */
  skewX?: number;
  /** The skew on the y axis. Defaults to `0`. */
  skewY?: number;
  /** The translation on the x axis. Defaults to `0`. */
  translateX?: number;
  /** The translation on the y axis. Defaults to `0`. */
  translateY?: number;
}

/**
 * Format a CSS transform matrix.
 *
 * @example
 * ```js
 * matrix({ scaleX: 0.5, scaleY: 0.5 });
 * // matrix(0.5, 0, 0, 0.5, 0, 0)
 * ```
 */
export function matrix(props: MatrixProps = {}): string {
  const { scaleX = 1, skewY = 0, skewX = 0, scaleY = 1, translateX = 0, translateY = 0 } = props;
  return `matrix(${scaleX}, ${skewY}, ${skewX}, ${scaleY}, ${translateX}, ${translateY})`;
}
