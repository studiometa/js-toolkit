import * as math from '../src/math';

test('math exports', () => {
  expect(Object.keys(math)).toEqual(['damp', 'lerp', 'map', 'round']);
});

test('math.round method', () => {
  const number = 50.23456789;
  expect(math.round(number)).toBe(50);
  expect(math.round(number, 1)).toBe(50.2);
  expect(math.round(number, 2)).toBe(50.23);
  expect(math.round(number, 3)).toBe(50.235);
  expect(math.round(number, 4)).toBe(50.2346);
});

test('math.damp method', () => {
  expect(math.damp(10, 0, 0.5)).toBe(5);
  expect(math.damp(10, 5, 0.5)).toBe(7.5);
  expect(math.damp(10, 10, 0.5)).toBe(10);
  expect(math.damp(10, 0, 0.25)).toBe(2.5);
  expect(math.damp(10, 5, 0.25)).toBe(6.25);
  expect(math.damp(10, 10, 0.25)).toBe(10);
  expect(math.damp(10, 10, 1)).toBe(10);
  expect(math.damp(10, 9.9999)).toBe(10);
});

test('math.lerp method', () => {
  expect(math.lerp(0, 10, 0)).toBe(0);
  expect(math.lerp(0, 10, 0.25)).toBe(2.5);
  expect(math.lerp(0, 10, 0.5)).toBe(5);
  expect(math.lerp(0, 10, 0.75)).toBe(7.5);
});

test('math.map method', () => {
  expect(math.map(0, 0, 1, 0, 10)).toBe(0);
  expect(math.map(0.5, 0, 1, 0, 10)).toBe(5);
  expect(math.map(1, 0, 1, 0, 10)).toBe(10);
  expect(math.map(2, 0, 1, 0, 10)).toBe(20);
});
