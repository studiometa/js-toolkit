import Cache from '~/utils/cache';

describe('cache method', () => {
  it('shoud create a new instance of Cache with ttl specified', () => {
    const testValues = { name: 'testCache', ttl: 50 };
    const testCache = new Cache(testValues);

    expect(testCache).toBeInstanceOf(Cache);
    expect(testCache).toHaveProperty('name', testValues.name);
    expect(testCache).toHaveProperty('store', {});
    expect(testCache).toHaveProperty('expire', testValues.ttl * 1000 * 60);
  });

  it('should create a new instance of Cache without ttl specified', () => {
    const testValues = { name: 'testCache' };
    const testCache = new Cache(testValues);

    expect(testCache).toBeInstanceOf(Cache);
    expect(testCache).toHaveProperty('name', testValues.name);
    expect(testCache).toHaveProperty('store', {});
    expect(testCache).toHaveProperty('expire', false);
  });

  it('should set an item in cache and return it with get function', () => {
    const testValues = { name: 'testCache' };
    const testCache = new Cache(testValues);

    testCache.set('testKey', 'testValue');
    expect(testCache.get('testKey')).toEqual('testValue');
  });

  it('should return undefined if item is expired', () => {
    const testValues = { name: 'testCache', ttl: -1 };
    const testCache = new Cache(testValues);

    testCache.set('testKey', 'testValue');
    expect(testCache.get('testKey')).toBeUndefined();
  });

  it('should remove one of two items', () => {
    const testValues = { name: 'testCache' };
    const testCache = new Cache(testValues);

    testCache.set('firstKey', 'firstValue');
    testCache.set('secondKey', 'secondValue');
    expect(testCache.get('firstKey')).toEqual('firstValue');
    expect(testCache.get('secondKey')).toEqual('secondValue');
    testCache.remove('firstKey');
    expect(testCache.get('firstKey')).toBeUndefined();
    expect(testCache.get('secondKey')).toEqual('secondValue');
  });

  it('should clear both items', () => {
    const testValues = { name: 'testCache' };
    const testCache = new Cache(testValues);

    testCache.set('firstKey', 'firstValue');
    testCache.set('secondKey', 'secondValue');
    expect(testCache.get('firstKey')).toEqual('firstValue');
    expect(testCache.get('secondKey')).toEqual('secondValue');
    testCache.clear();
    expect(testCache.get('firstKey')).toBeUndefined();
    expect(testCache.get('secondKey')).toBeUndefined();
  });
});
