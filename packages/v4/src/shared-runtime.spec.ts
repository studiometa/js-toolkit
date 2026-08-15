import { describe, expect, it, vi } from 'vitest';
import { getSharedRuntimeSlot } from './shared-runtime.js';

describe('shared runtime slots', () => {
  it('initializes a compatible slot once', () => {
    const host = {};
    const initialize = vi.fn(() => ({ id: 1 }));

    const first = getSharedRuntimeSlot('test', 1, initialize, host);
    const second = getSharedRuntimeSlot('test', 1, initialize, host);

    expect(second).toBe(first);
    expect(initialize).toHaveBeenCalledOnce();
  });

  it('rejects an incompatible global owner', () => {
    const key = Symbol.for('@studiometa/js-toolkit-v4/runtime');
    const host = { [key]: { revision: 2, slots: new Map() } };

    expect(() => getSharedRuntimeSlot('test', 1, () => ({}), host)).toThrowError(
      /incompatible value already owns/,
    );
  });

  it('rejects an incompatible slot revision', () => {
    const host = {};
    getSharedRuntimeSlot('test', 1, () => ({}), host);

    expect(() => getSharedRuntimeSlot('test', 2, () => ({}), host)).toThrowError(
      /slot "test" has revision 1; revision 2 is required/,
    );
  });
});
