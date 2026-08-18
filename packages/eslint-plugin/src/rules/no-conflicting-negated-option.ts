import {
  createRule,
  findComponentConfig,
  getKeyName,
  getProperty,
  toPascalCase,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/**
 * Returns true if an option declaration can hold a boolean, in any of the
 * spellings v4 accepts: the shorthand `Boolean`, a union `[Boolean, String]`,
 * or the long form `{ type: Boolean }`.
 */
function isBooleanOption(value: Node): boolean {
  if (!value) return false;

  if (value.type === 'Identifier') return value.name === 'Boolean';

  if (value.type === 'ArrayExpression') {
    return (value.elements ?? []).some(
      (element: Node) => element?.type === 'Identifier' && element.name === 'Boolean',
    );
  }

  if (value.type === 'ObjectExpression') {
    return isBooleanOption(getProperty(value, 'type'));
  }

  return false;
}

export const noConflictingNegatedOption = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow declaring both a boolean option and its negated spelling',
    },
    messages: {
      conflict:
        'Option "{{negated}}" claims `data-option-no-{{attribute}}`, which is also how the boolean option "{{name}}" is turned off. One attribute would mean two things. Rename one of them.',
    },
  },
  createOnce(context: RuleContext) {
    function check(node: Node) {
      const options = getProperty(findComponentConfig(node), 'options');
      if (options?.type !== 'ObjectExpression') return;

      const declared = new Map<string, Node>();

      for (const property of options.properties ?? []) {
        if (property.type !== 'Property') continue;
        const name = getKeyName(property);
        if (name) declared.set(name, property);
      }

      for (const [name, property] of declared) {
        if (!isBooleanOption(property.value)) continue;

        const negated = `no${toPascalCase(name)}`;
        const conflicting = declared.get(negated);
        if (!conflicting) continue;

        context.report({
          node: conflicting.key ?? conflicting,
          messageId: 'conflict',
          data: {
            name,
            negated,
            attribute: name.replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
          },
        });
      }
    }

    return {
      ClassDeclaration: check,
      ClassExpression: check,
    };
  },
});
