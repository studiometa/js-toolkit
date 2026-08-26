import { describe, expect, it } from 'vitest';
import { compileExpression } from './expression.js';

describe('compileExpression', () => {
  it('does not collide two argument lists split at different boundaries', () => {
    // `Action`'s v3 predecessor keyed its cache by `effectDefinition +
    // keys.join('')`, under which `['Ab', 'C']` and `['A', 'bC']` land in the
    // same entry: joined without a separator, both produce `AbC`. A body that
    // returns its first argument must resolve `Ab` and `A` to their own value,
    // not to whichever list compiled first.
    const first = compileExpression(['Ab', 'C'], 'return Ab;');
    const second = compileExpression(['A', 'bC'], 'return A;');

    expect(first('one', 'two')).toBe('one');
    expect(second('three', 'four')).toBe('three');
  });

  it('reuses the compiled function for the same argument names and body', () => {
    const first = compileExpression(['x'], 'return x;');
    const second = compileExpression(['x'], 'return x;');

    expect(first).toBe(second);
  });
});
