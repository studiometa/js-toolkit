import {
  createRule,
  findComponentConfig,
  getKeyName,
  getProperty,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

export const optionDefaultFactory = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a factory for an option default which is an object or an array',
    },
    messages: {
      literalDefault:
        'Option "{{name}}" declares a literal {{kind}} default, which every instance of this component then shares — one instance mutating it mutates it for all of them. Declare it as a factory: `default: () => ({{example}})`.',
    },
  },
  createOnce(context: RuleContext) {
    function check(node: Node) {
      const options = getProperty(findComponentConfig(node), 'options');
      if (options?.type !== 'ObjectExpression') return;

      for (const property of options.properties ?? []) {
        if (property.type !== 'Property') continue;

        const name = getKeyName(property);
        if (!name || property.value?.type !== 'ObjectExpression') continue;

        const fallback = getProperty(property.value, 'default');
        if (!fallback) continue;

        if (fallback.type === 'ObjectExpression') {
          context.report({
            node: fallback,
            messageId: 'literalDefault',
            data: { name, kind: 'object', example: '{}' },
          });
        } else if (fallback.type === 'ArrayExpression') {
          context.report({
            node: fallback,
            messageId: 'literalDefault',
            data: { name, kind: 'array', example: '[]' },
          });
        }
      }
    }

    return {
      ClassDeclaration: check,
      ClassExpression: check,
    };
  },
});
