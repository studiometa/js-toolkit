import { describe, it, expect } from 'bun:test';
import {
  addClass as add,
  removeClass as remove,
  toggleClass as toggle,
} from '@studiometa/js-toolkit/utils';

describe('classes methods', () => {
  const element = document.createElement('div');

  it('should add classes to an element', () => {
    add(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
  });

  it('should add classes to an element when empty spaces are added to the class parameter', () => {
    add(element, 'foo  bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
  });

  it('should remove classes from an element', () => {
    remove(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should toggle classes from an element', () => {
    toggle(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
    toggle(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should work with array of classes', () => {
    add(element, ['foo', 'bar']);
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
  });

  it('should fail silently', () => {
    expect(add(element)).toBeUndefined();
    expect(add()).toBeUndefined();
  });
});
