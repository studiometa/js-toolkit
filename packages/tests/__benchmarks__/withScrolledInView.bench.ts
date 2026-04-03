import { describe, bench } from 'vitest';
import {
  normalizeOffset,
  parseNamedOffset,
  getEdgeWithOffset,
  getEdges,
} from '#private/decorators/withScrolledInView/utils.js';
import { clamp, clamp01, damp } from '@studiometa/js-toolkit/utils';

describe('withScrolledInView', () => {
  describe('offset parsing (runs on resize)', () => {
    bench('normalizeOffset (default offset string)', () => {
      normalizeOffset('start end / end start');
    });

    bench('normalizeOffset (custom offset string)', () => {
      normalizeOffset('center center / end start');
    });

    bench('parseNamedOffset (named: "start")', () => {
      parseNamedOffset('start');
    });

    bench('parseNamedOffset (named: "center")', () => {
      parseNamedOffset('center');
    });

    bench('parseNamedOffset (numeric: 0.5)', () => {
      parseNamedOffset(0.5);
    });

    bench('parseNamedOffset (string number: "0.5")', () => {
      parseNamedOffset('0.5');
    });

    bench('parseNamedOffset (percentage: "50%")', () => {
      parseNamedOffset('50%');
    });

    bench('parseNamedOffset (viewport unit: "50vh")', () => {
      parseNamedOffset('50vh');
    });

    bench('parseNamedOffset (px unit: "100px")', () => {
      parseNamedOffset('100px');
    });
  });

  describe('edge calculation (runs on resize)', () => {
    bench('getEdgeWithOffset (numeric ratio)', () => {
      getEdgeWithOffset(500, 100, 0);
    });

    bench('getEdgeWithOffset (named offset "start")', () => {
      getEdgeWithOffset(500, 100, 'start');
    });

    bench('getEdgeWithOffset (named offset "end")', () => {
      getEdgeWithOffset(500, 100, 'end');
    });

    bench('getEdgeWithOffset (percentage "50%")', () => {
      getEdgeWithOffset(500, 100, '50%');
    });

    bench('getEdgeWithOffset (viewport unit "50vh")', () => {
      getEdgeWithOffset(500, 100, '50vh');
    });

    bench('getEdgeWithOffset (px unit "100px")', () => {
      getEdgeWithOffset(500, 100, '100px');
    });

    const offset = normalizeOffset('start end / end start');
    const targetSizes = { x: 500, y: 500, width: 100, height: 100 };
    const containerSizes = { x: 0, y: 0, width: 1920, height: 1080 };

    bench('getEdges (y axis, named offsets)', () => {
      getEdges('y', targetSizes, containerSizes, offset);
    });

    bench('getEdges (x axis, named offsets)', () => {
      getEdges('x', targetSizes, containerSizes, offset);
    });

    const percentOffset = normalizeOffset('0% 100% / 100% 0%');

    bench('getEdges (y axis, percentage offsets)', () => {
      getEdges('y', targetSizes, containerSizes, percentOffset);
    });
  });

  describe('per-frame computation (runs every rAF tick)', () => {
    // Simulate the updateProps hot path: clamp + damp + progress calculation
    const start = -580;
    const end = 600;
    const range = end - start;
    let currentY = 0;
    let dampedY = 0;

    bench('clamp (scroll position)', () => {
      currentY = clamp(Math.random() * 1200, start, end);
    });

    bench('damp (damped current)', () => {
      dampedY = damp(currentY, dampedY, 0.1, 0.001);
    });

    bench('progress calculation (division + clamp01)', () => {
      clamp01((currentY - start) / range);
    });

    bench('full updateProps equivalent (1 axis)', () => {
      const scrollY = Math.random() * 1200;
      const current = clamp(scrollY, start, end);
      const damped = damp(current, dampedY, 0.1, 0.001);
      dampedY = damped;
      clamp01((current - start) / range);
      clamp01((damped - start) / range);
    });

    bench('full updateProps equivalent (2 axes)', () => {
      const scrollY = Math.random() * 1200;
      const scrollX = Math.random() * 1200;

      // Y axis
      const currentYVal = clamp(scrollY, start, end);
      const dampedYVal = damp(currentYVal, dampedY, 0.1, 0.001);
      dampedY = dampedYVal;
      clamp01((currentYVal - start) / range);
      clamp01((dampedYVal - start) / range);

      // X axis
      const currentXVal = clamp(scrollX, start, end);
      const dampedXVal = damp(currentXVal, 0, 0.1, 0.001);
      clamp01((currentXVal - start) / range);
      clamp01((dampedXVal - start) / range);
    });

    // Benchmark the updateProgress pattern with division vs pre-computed inverse
    bench('progress with division', () => {
      const current = Math.random() * 1180 + start;
      // Original: (current - start) / (end - start)
      clamp01((current - start) / (end - start));
    });

    bench('progress with pre-computed inverse', () => {
      const inverseRange = 1 / (end - start);
      const current = Math.random() * 1180 + start;
      clamp01((current - start) * inverseRange);
    });
  });
});
