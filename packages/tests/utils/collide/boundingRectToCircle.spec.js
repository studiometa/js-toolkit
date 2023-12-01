import { boundingRectToCircle } from '@studiometa/js-toolkit/utils';

describe('boundingRectToCircle method', () => {
  it('should be a circle object when a valid DOMRect is passed', () => {
    const clientRect = { x: 0, y: 0, width: 100, height: 100 };
    const result = boundingRectToCircle(clientRect);

    expect(result).toEqual({
      x: 50,
      y: 50,
      radius: 50,
    });
  });

  it('should throw an error when an invalid DOMRect is passed', () => {
    expect(() => {
      const clientRect = { x: 0, y: 0, width: 50, height: 100 };
      boundingRectToCircle(clientRect);
    }).toThrow('Initial DOMElement is not a square. Please use the force mode.');
  });

  it('should be a circle object when an invalid DOMRect is passed with force mode', () => {
    const clientRect = { x: 0, y: 0, width: 150, height: 100 };
    const result = boundingRectToCircle(clientRect, true);

    expect(result).toEqual({
      x: 75,
      y: 50,
      radius: 62.5,
    });
  });
});
