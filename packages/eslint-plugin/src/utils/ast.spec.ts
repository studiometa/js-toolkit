import { describe, it, expect } from 'vitest';
import { findComponentConfig, getProperty, hasDecorator, isComponentClass, walk } from './ast.ts';

/**
 * Decorators and type arguments cannot go through the RuleTester — its parser
 * is espree, which reads neither. The helpers reading them are unit tested
 * against hand-built nodes instead, and the rules using them are exercised
 * end to end by `oxlint` over `packages/v4`, which parses both.
 */

const decorator = (name: string, called = false) => ({
  type: 'Decorator',
  expression: called
    ? { type: 'CallExpression', callee: { type: 'Identifier', name }, arguments: [] }
    : { type: 'Identifier', name },
});

describe('hasDecorator', () => {
  it('reads a bare decorator', () => {
    expect(hasDecorator({ decorators: [decorator('write')] }, new Set(['read', 'write']))).toBe(
      true,
    );
  });

  it('reads a called decorator', () => {
    expect(
      hasDecorator({ decorators: [decorator('read', true)] }, new Set(['read', 'write'])),
    ).toBe(true);
  });

  it('ignores an unrelated decorator', () => {
    expect(hasDecorator({ decorators: [decorator('on')] }, new Set(['read', 'write']))).toBe(false);
  });

  it('handles a member with no decorators', () => {
    expect(hasDecorator({}, new Set(['write']))).toBe(false);
  });
});

describe('isComponentClass', () => {
  it('accepts a class extending an identifier', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'Base' },
      }),
    ).toBe(true);
  });

  it('accepts a class extending a mixin call carrying type arguments', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: {
          type: 'TSInstantiationExpression',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'withRaf' },
            arguments: [],
          },
        },
      }),
    ).toBe(true);
  });

  it('accepts a decorated class which extends nothing', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        decorators: [decorator('component', true)],
        superClass: null,
      }),
    ).toBe(true);
  });

  it('rejects a plain class', () => {
    expect(isComponentClass({ type: 'ClassDeclaration', superClass: null })).toBe(false);
  });

  it('rejects a node which is not a class', () => {
    expect(isComponentClass({ type: 'FunctionDeclaration' })).toBe(false);
  });
});

describe('findComponentConfig', () => {
  const options = {
    type: 'ObjectExpression',
    properties: [
      {
        type: 'Property',
        key: { type: 'Identifier', name: 'name' },
        value: { type: 'Literal', value: 'Foo' },
      },
    ],
  };

  it('reads the object of a @component decorator', () => {
    const node = {
      type: 'ClassDeclaration',
      decorators: [
        {
          type: 'Decorator',
          expression: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'component' },
            arguments: [options],
          },
        },
      ],
      body: { body: [] },
    };
    expect(findComponentConfig(node)).toBe(options);
  });

  it('reads a static config property', () => {
    const node = {
      type: 'ClassDeclaration',
      body: {
        body: [
          {
            type: 'PropertyDefinition',
            static: true,
            key: { type: 'Identifier', name: 'config' },
            value: options,
          },
        ],
      },
    };
    expect(findComponentConfig(node)).toBe(options);
  });

  it('returns null when there is neither', () => {
    expect(findComponentConfig({ type: 'ClassDeclaration', body: { body: [] } })).toBe(null);
  });
});

describe('getProperty', () => {
  it('reads an identifier key and a literal key alike', () => {
    const object = {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'Property',
          key: { type: 'Identifier', name: 'a' },
          value: { type: 'Literal', value: 1 },
        },
        {
          type: 'Property',
          key: { type: 'Literal', value: 'b' },
          value: { type: 'Literal', value: 2 },
        },
      ],
    };

    expect(getProperty(object, 'a')).toEqual({ type: 'Literal', value: 1 });
    expect(getProperty(object, 'b')).toEqual({ type: 'Literal', value: 2 });
    expect(getProperty(object, 'c')).toBe(null);
  });
});

describe('walk', () => {
  it('visits every descendant and skips a subtree on false', () => {
    const tree = {
      type: 'Program',
      body: [
        { type: 'A', child: { type: 'B' } },
        { type: 'C', child: { type: 'D' } },
      ],
    };

    const seen: string[] = [];
    walk(tree, (node) => {
      seen.push(node.type);
      if (node.type === 'A') return false;
    });

    expect(seen).toEqual(['Program', 'A', 'C', 'D']);
  });

  it('tolerates a missing node', () => {
    expect(() => walk(undefined as never, () => {})).not.toThrow();
  });
});
