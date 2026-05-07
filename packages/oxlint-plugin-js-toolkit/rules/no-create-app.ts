import { type Node, type RuleContext } from '../utils/ast.ts';

export const noCreateApp = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow createApp() — use registerComponent() instead',
    },
    messages: {
      useRegister:
        'createApp() is deprecated. Use registerComponent() from @studiometa/js-toolkit instead.',
    },
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee.type === 'Identifier' && callee.name === 'createApp') {
          context.report({ node, messageId: 'useRegister' });
        }
      },
    };
  },
};
