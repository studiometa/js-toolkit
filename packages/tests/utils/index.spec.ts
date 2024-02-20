import { describe, it, expect } from 'bun:test';
import * as utils from '@studiometa/js-toolkit/utils';

describe('@studiometa/js-toolkit/utils exports', () => {
  it('should export all scripts', () => {
    expect(Object.keys(utils)).toMatchSnapshot();
  });
});
