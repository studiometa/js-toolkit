import { describe, it, expect } from 'bun:test';
import * as base from '#private/Base/index.js';

describe('Base/index.js exports', () => {
  it('should export a specific list of things', () => {
    expect(Object.keys(base)).toMatchSnapshot();
  });
});
