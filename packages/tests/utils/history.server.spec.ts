import { describe, it, expect } from 'vitest';
import { objectToURLSearchParams } from '@studiometa/js-toolkit/utils';

describe('The `objectToURLSearchParams` method', () => {
  it('should work server side', () => {
    expect(objectToURLSearchParams({ foo: 'bar' })).toBeInstanceOf(URLSearchParams);
  });
});
