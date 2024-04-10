import { describe, it, expect, jest } from 'bun:test';
import { eachElements } from '#private/utils/css/utils.js';

describe('The `eachElements` function', () => {
  it('should accept a single element', () => {
    const fn = jest.fn(() => true);
    const result = eachElements(document.body, fn);
    expect(result).toEqual([true]);
  });

  it('should accept an array of elements', () => {
    const fn = jest.fn((element) => element);
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const result = eachElements([div1, div2], fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toEqual(div1);
    expect(fn.mock.calls[1][0]).toEqual(div2);
    expect(result).toEqual([div1, div2]);
  });

  it('should accept a NodeList', () => {
    const fn = jest.fn((element) => element);
    const div = document.createElement('div');
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div.append(div1, div2);
    const result = eachElements(div.querySelectorAll('div'), fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toEqual(div1);
    expect(fn.mock.calls[1][0]).toEqual(div2);
    expect(result).toEqual([div1, div2]);
  });
});
