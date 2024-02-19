import { describe, it, expect } from 'bun:test';
import * as toolkit from '@studiometa/js-toolkit';

describe('The package exports', () => {
  it('should export helpers and the Base class', () => {
    expect(Object.keys(toolkit)).toMatchSnapshot();
  });
});
