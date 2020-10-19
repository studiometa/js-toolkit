import getValueDeep from '~/utils/object/getValueDeep';

describe('getValueDeep method', () => {
  const obj = {
    foo: {
      bar: 'baz',
      array: ['one', 'two', 'three']
    }
  };

  it('should return a value by its path', () => {
    expect(getValueDeep(obj, 'foo.bar')).toBe('baz');
  });

  it('should return false if the value was not found', () => {
    expect(getValueDeep(obj, 'foo.inexistantProp.bar')).toBe(false);
  });

  it('should work with an array', () => {
    expect(getValueDeep(obj, 'foo.array')).toEqual(['one', 'two', 'three']);
    expect(getValueDeep(obj, 'foo.array.0')).toBe('one');
    expect(getValueDeep(obj, 'foo.array.6')).toBe(false);
  });

  it('should return the object if no path provided', () => {
    expect(getValueDeep(obj)).toBe(obj);
  });
});
