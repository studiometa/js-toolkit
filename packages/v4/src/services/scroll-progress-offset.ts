/**
 * One token in an element or viewport edge. Named edges, ratios, percentages,
 * pixels and viewport units use the offset grammar from v3.
 */
export type OffsetValue = string | number;

/** The start pair and end pair in `"<target> <viewport> / <target> <viewport>"`. */
export type NormalizedOffset = [[OffsetValue, OffsetValue], [OffsetValue, OffsetValue]];

const NAMED: Record<string, number> = { start: 0, center: 0.5, end: 1 };

const VIEWPORT_UNITS: Record<string, () => number> = {
  vh: () => window.innerHeight,
  vw: () => window.innerWidth,
  vmin: () => Math.min(window.innerWidth, window.innerHeight),
  vmax: () => Math.max(window.innerWidth, window.innerHeight),
};

/** Parse the two target/viewport edge pairs. */
export function normalizeOffset(offsets: string): NormalizedOffset {
  return offsets
    .split('/')
    .map((offset) => offset.trim().split(' ').slice(0, 2)) as NormalizedOffset;
}

/** Resolve one edge token against a box. */
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

  return start + size * value;
}

export interface AxisRect {
  position: number;
  size: number;
}

/** Get the scroll positions where one axis starts and ends. */
export function getEdges(
  target: AxisRect,
  viewport: AxisRect,
  offset: NormalizedOffset,
): [number, number] {
  const start =
    getEdgeWithOffset(target.position, target.size, offset[0][0]) -
    getEdgeWithOffset(0, viewport.size, offset[0][1]);
  const end =
    getEdgeWithOffset(target.position, target.size, offset[1][0]) -
    getEdgeWithOffset(0, viewport.size, offset[1][1]);
  return [start, end];
}
