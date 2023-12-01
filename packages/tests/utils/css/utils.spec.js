import { jest } from '@jest/globals';
// eslint-disable-next-line import/no-unresolved
import { eachElements } from '@studiometa/js-toolkit/utils/css/utils.js';

describe('The `eachElements` function', () => {
  it('should accept a single element', () => {
    const fn = jest.fn(() => true);
    const result = eachElements(document.body, fn);
    expect(result).toEqual([true]);
  });

  it('should accept an array of elements', () => {
    const fn = jest.fn((element) => element);
    const result = eachElements([document.body, document.documentElement], fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveReturnedWith(document.body);
    expect(fn).toHaveReturnedWith(document.documentElement);
    expect(result).toEqual([document.body, document.documentElement]);
  });

  it('should accept a NodeList', () => {
    const fn = jest.fn((element) => element);
    const result = eachElements(document.querySelectorAll('body, html'), fn);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveReturnedWith(document.body);
    expect(fn).toHaveReturnedWith(document.documentElement);
    expect(result).toEqual([document.documentElement, document.body]);
  });
});
