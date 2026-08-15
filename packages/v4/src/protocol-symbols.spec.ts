import { describe, expect, it } from 'vitest';
import { HANDLER_REGISTRATIONS, SOURCE } from './protocol-symbols.js';

describe('cross-copy protocol symbols', () => {
  it('uses stable, package-scoped registry keys', () => {
    expect(Symbol.keyFor(SOURCE)).toBe('@studiometa/js-toolkit-v4/source');
    expect(Symbol.keyFor(HANDLER_REGISTRATIONS)).toBe(
      '@studiometa/js-toolkit-v4/handler-registrations',
    );
  });
});
