import { describe, expect, it } from 'vitest';
import { isBoolean, isDefined, isFunction, isNull, isNumber, isObject, isString } from './is.js';

describe('isNull', () => {
  it('answers for `null` only', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isNull(0)).toBe(false);
  });
});

describe('isDefined', () => {
  it('excludes `undefined` and nothing else', () => {
    expect(isDefined(null)).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined('')).toBe(true);
    expect(isDefined(undefined)).toBe(false);
  });
});

describe('isString', () => {
  it('answers for strings', () => {
    expect(isString('')).toBe(true);
    expect(isString(String('foo'))).toBe(true);
    expect(isString(1)).toBe(false);
  });
});

describe('isNumber', () => {
  it('excludes `NaN`', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(true);
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isNumber('1')).toBe(false);
  });
});

describe('isBoolean', () => {
  it('answers for booleans', () => {
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });
});

describe('isFunction', () => {
  it('answers for anything callable', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(class {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });
});

describe('isObject', () => {
  it('answers for plain objects only', () => {
    expect(isObject({})).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(new Date())).toBe(false);
    expect(isObject(document.createElement('div'))).toBe(false);
    expect(isObject(() => {})).toBe(false);
  });
});
