/**
 * Offset parsing for `withScrolledInView`, ported from
 * `@studiometa/js-toolkit/decorators/withScrolledInView/utils`.
 *
 * The syntax is unchanged: `"<target> <container> / <target> <container>"`,
 * where each edge is `start` / `center` / `end`, a ratio, a percentage, or a
 * length in `px` / `vh` / `vw` / `vmin` / `vmax`.
 */

export type OffsetValue = string | number;
export type NormalizedOffset = [[OffsetValue, OffsetValue], [OffsetValue, OffsetValue]];

const NAMED: Record<string, number> = { start: 0, center: 0.5, end: 1 };

const VIEWPORT_UNITS: Record<string, () => number> = {
  vh: () => window.innerHeight,
  vw: () => window.innerWidth,
  vmin: () => Math.min(window.innerWidth, window.innerHeight),
  vmax: () => Math.max(window.innerWidth, window.innerHeight),
};

export function normalizeOffset(offsets: string): NormalizedOffset {
  return offsets
    .split('/')
    .map((offset) => offset.trim().split(' ').slice(0, 2)) as NormalizedOffset;
}

/**
 * An edge position given a start, a size and one offset token.
 */
export function getEdgeWithOffset(start: number, size: number, offset: OffsetValue): number {
  if (typeof offset === 'number') {
    return start + size * offset;
  }

  if (offset in NAMED) {
    return start + size * NAMED[offset];
  }

  if (offset.endsWith('%')) {
    return start + (size * Number.parseFloat(offset)) / 100;
  }

  const value = Number.parseFloat(offset);
  if (Number.isNaN(value)) {
    return start;
  }

  if (offset.endsWith('px')) {
    return start + value;
  }

  for (const [unit, size100] of Object.entries(VIEWPORT_UNITS)) {
    if (offset.endsWith(unit)) {
      return start + (value * size100()) / 100;
    }
  }

  // A bare number, e.g. "0.5".
  return start + size * value;
}

export interface AxisRect {
  position: number;
  size: number;
}

/**
 * The scroll positions at which the animation starts and ends on one axis.
 */
export function getEdges(
  target: AxisRect,
  container: AxisRect,
  offset: NormalizedOffset,
): [number, number] {
  const start =
    getEdgeWithOffset(target.position, target.size, offset[0][0]) -
    getEdgeWithOffset(0, container.size, offset[0][1]);
  const end =
    getEdgeWithOffset(target.position, target.size, offset[1][0]) -
    getEdgeWithOffset(0, container.size, offset[1][1]);
  return [start, end];
}
