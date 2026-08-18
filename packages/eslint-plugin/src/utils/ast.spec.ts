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
  /** `this.<name>` inside a method body, as the parser would build it. */
  const bodyUsing = (name: string) => ({
    type: 'ClassBody',
    body: [
      {
        type: 'MethodDefinition',
        key: { type: 'Identifier', name: 'mounted' },
        value: {
          type: 'FunctionExpression',
          body: {
            type: 'BlockStatement',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'MemberExpression',
                  computed: false,
                  object: { type: 'ThisExpression' },
                  property: { type: 'Identifier', name },
                },
              },
            ],
          },
        },
      },
    ],
  });

  const emptyBody = { type: 'ClassBody', body: [] };

  it('accepts a class extending an identifier and using the surface', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'Base' },
        body: bodyUsing('$el'),
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
        body: bodyUsing('$emit'),
      }),
    ).toBe(true);
  });

  it('accepts a decorated class', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        decorators: [decorator('component', true)],
        superClass: { type: 'Identifier', name: 'Base' },
        body: emptyBody,
      }),
    ).toBe(true);
  });

  it('rejects a class extending nothing, which is how Base itself stays out', () => {
    // `Base` declares `static config` and defines the whole surface, but it
    // extends nothing — and it is not a class to be told to call `$read()`.
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: null,
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              static: true,
              key: { type: 'Identifier', name: 'config' },
              value: { type: 'ObjectExpression', properties: [] },
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it('accepts a class declaring a static config, whatever it extends', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'AbstractPrefetch' },
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              static: true,
              key: { type: 'Identifier', name: 'config' },
              value: { type: 'ObjectExpression', properties: [] },
            },
          ],
        },
      }),
    ).toBe(true);
  });

  it('accepts a subclass of a local abstract component through the surface', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'AbstractCarouselChild' },
        body: bodyUsing('$refs'),
      }),
    ).toBe(true);
  });

  it('rejects a class which only extends something', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'Error' },
        body: bodyUsing('message'),
      }),
    ).toBe(false);
  });

  it('rejects a plain class', () => {
    expect(isComponentClass({ type: 'ClassDeclaration', superClass: null, body: emptyBody })).toBe(
      false,
    );
  });

  it('does not read a nested class as the outer one', () => {
    expect(
      isComponentClass({
        type: 'ClassDeclaration',
        superClass: { type: 'Identifier', name: 'Error' },
        body: {
          type: 'ClassBody',
          body: [
            {
              type: 'PropertyDefinition',
              key: { type: 'Identifier', name: 'inner' },
              value: {
                type: 'ClassExpression',
                superClass: { type: 'Identifier', name: 'Base' },
                body: bodyUsing('$el'),
              },
            },
          ],
        },
      }),
    ).toBe(false);
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
