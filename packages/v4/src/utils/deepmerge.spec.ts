import { describe, expect, it } from 'vitest';
import { deepmerge, deepmergeAll } from './deepmerge.js';

describe('deepmerge', () => {
  it('recurses into plain objects, keeping the keys the source does not name', () => {
    expect(deepmerge({ ecommerce: { currency: 'EUR' } }, { ecommerce: { items: [1] } })).toEqual({
      ecommerce: { currency: 'EUR', items: [1] },
    });
  });

  it('lets the source win on a conflict', () => {
    expect(deepmerge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
  });

  it('replaces arrays instead of concatenating them', () => {
    expect(deepmerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] });
    expect(deepmerge({ a: [1, 2] }, { a: [] })).toEqual({ a: [] });
  });

  it('mutates neither input', () => {
    const target = { a: { b: 1 } };
    const source = { a: { c: 2 } };
    deepmerge(target, source);
    expect(target).toEqual({ a: { b: 1 } });
    expect(source).toEqual({ a: { c: 2 } });
  });

  it('shares no plain object or array with either input', () => {
    const target = { a: { b: 1 }, list: [{ n: 1 }] };
    const source = { c: { d: 2 } };
    const merged = deepmerge(target, source) as {
      a: { b: number };
      c: { d: number };
      list: { n: number }[];
    };

    merged.a.b = 99;
    merged.c.d = 99;
    merged.list[0].n = 99;

    expect(target.a.b).toBe(1);
    expect(target.list[0].n).toBe(1);
    expect(source.c.d).toBe(2);
  });

  it('passes non-plain values through whole', () => {
    const date = new Date(0);
    const map = new Map([['k', 'v']]);
    class Payload {
      n = 1;
    }
    const instance = new Payload();

    const merged = deepmerge({ n: null }, { date, map, instance, n: 0, ok: false });

    // Values, not structures to merge: shared rather than copied.
    expect(merged.date).toBe(date);
    expect(merged.map).toBe(map);
    expect(merged.instance).toBe(instance);
    expect(merged.n).toBe(0);
    expect(merged.ok).toBe(false);
  });

  it('replaces a plain object with a class instance rather than merging into it', () => {
    class Payload {
      n = 2;
    }
    const merged = deepmerge({ p: { n: 1, other: true } }, { p: new Payload() });
    expect(merged.p).toBeInstanceOf(Payload);
    expect((merged.p as Payload & { other?: boolean }).other).toBeUndefined();
  });

  it('merges an object with no prototype', () => {
    const source = Object.assign(Object.create(null) as Record<string, unknown>, { b: 2 });
    expect(deepmerge({ a: { b: 1, c: 3 } }, { a: source })).toEqual({ a: { b: 2, c: 3 } });
  });

  it('merges an object carrying its own `constructor` key', () => {
    const source = JSON.parse('{"a":{"constructor":"nope","b":2}}') as Record<string, unknown>;
    const merged = deepmerge({ a: { b: 1, c: 3 } }, source) as { a: Record<string, unknown> };
    expect(merged.a.b).toBe(2);
    expect(merged.a.c).toBe(3);
    expect(merged.a.constructor).toBe(Object);
  });

  describe('prototype safety', () => {
    // Payloads are parsed out of the page, so these keys are reachable input.
    const attacker = () => JSON.parse('{"__proto__":{"polluted":"yes"}}') as Record<string, never>;

    it('drops a `__proto__` key from the source', () => {
      const merged = deepmerge({ x: 1 }, attacker());
      expect(Object.keys(merged)).toEqual(['x']);
      expect((merged as { polluted?: string }).polluted).toBeUndefined();
      expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    });

    it('drops it from a nested value too, which only `clone()` visits', () => {
      const merged = deepmerge({}, { nested: attacker() }) as { nested: { polluted?: string } };
      expect(merged.nested.polluted).toBeUndefined();
      expect(Object.getPrototypeOf(merged.nested)).toBe(Object.prototype);
    });

    it('leaves the global prototype alone', () => {
      deepmerge({ x: 1 }, attacker());
      deepmergeAll([{ x: 1 }, attacker()]);
      expect(({} as { polluted?: string }).polluted).toBeUndefined();
    });
  });
});

describe('deepmergeAll', () => {
  it('merges left to right, the rightmost winning', () => {
    expect(deepmergeAll([{ a: 1 }, { a: 2, b: 1 }, { b: 2 }])).toEqual({ a: 2, b: 2 });
  });

  it('recurses through every layer', () => {
    expect(
      deepmergeAll([{ e: { currency: 'EUR' } }, { e: { items: [1] } }, { e: { items: [2] } }]),
    ).toEqual({ e: { currency: 'EUR', items: [2] } });
  });

  it('answers an empty object for no layer', () => {
    expect(deepmergeAll([])).toEqual({});
  });
});
