/**
 * @jest-environment node
 */
import { objectToURLSearchParams } from '@studiometa/js-toolkit/utils/history';

describe('The `objectToURLSearchParams` method', () => {
  it('should work server side', () => {
    expect(objectToURLSearchParams({ foo: 'bar' })).toBeInstanceOf(URLSearchParams);
  });
});
