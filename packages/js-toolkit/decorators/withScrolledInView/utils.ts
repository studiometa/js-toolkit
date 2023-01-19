import { isNumber, isString } from '../../utils/index.js';
import type { NormalizedOffset } from './types.js';

const units = {
  px: 'px',
  vh: 'vh',
  vw: 'vw',
  vmin: 'vmin',
  vmax: 'vmax',
  percent: '%',
};

const namedOffsets = {
  start: 0,
  center: 0.5,
  end: 1,
};

/**
 * Normalize offset input.
 */
export function normalizeOffset(offsets: string): NormalizedOffset {
  return offsets
    .split('/')
    .map((offset) => offset.trim().split(' ').slice(0, 2)) as NormalizedOffset;
}

/**
 * Parse the given offset.
 */
export function parseNamedOffset(offset: string | number): string | number {
  if (isNumber(offset)) {
    return offset;
  }

  if (isNumber(namedOffsets[offset])) {
    return namedOffsets[offset];
  }

  if (isNumber(Number(offset))) {
    return Number(offset);
  }

  if (isString(offset) && offset.endsWith(units.percent)) {
    return Number.parseFloat(offset) / 100;
  }

  return offset;
}

/**
 * Get an edge value given a start, size and offset value.
 */
export function getEdgeWithOffset(start: number, size: number, offset: string | number): number {
  if (isNumber(offset)) {
    return start + size * offset;
  }

  const parsedNamedOffset = parseNamedOffset(offset);
  if (isNumber(parsedNamedOffset)) {
    return start + size * parsedNamedOffset;
  }

  if (isString(parsedNamedOffset)) {
    const parsedOffset = Number.parseFloat(parsedNamedOffset);

    if (parsedNamedOffset.endsWith(units.px)) {
      return start + parsedOffset;
    }

    if (parsedNamedOffset.endsWith(units.vh)) {
      return start + (parsedOffset * window.innerHeight) / 100;
    }

    if (parsedNamedOffset.endsWith(units.vw)) {
      return start + (parsedOffset * window.innerWidth) / 100;
    }

    if (parsedNamedOffset.endsWith(units.vmin)) {
      return start + (parsedOffset * Math.min(window.innerWidth, window.innerHeight)) / 100;
    }

    if (parsedNamedOffset.endsWith(units.vmax)) {
      return start + (parsedOffset * Math.max(window.innerWidth, window.innerHeight)) / 100;
    }
  }

  return start;
}

/**
 * Get starting and ending edges for a given axis, a target sizings, a container sizings and their offset.
 */
export function getEdges(axis: 'x' | 'y', targetSizes, containerSizes, offset): [number, number] {
  const sizeKey = axis === 'x' ? 'width' : 'height';
  const targetStart = getEdgeWithOffset(targetSizes[axis], targetSizes[sizeKey], offset[0][0]);
  const containerStart = getEdgeWithOffset(0, containerSizes[sizeKey], offset[0][1]);
  const targetEnd = getEdgeWithOffset(targetSizes[axis], targetSizes[sizeKey], offset[1][0]);
  const containerEnd = getEdgeWithOffset(0, containerSizes[sizeKey], offset[1][1]);
  const start = targetStart - containerStart;
  const end = targetEnd - containerEnd;

  return [start, end];
}
