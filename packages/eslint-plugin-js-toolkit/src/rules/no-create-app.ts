import { type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const noCreateApp = createRule({
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
  createOnce(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee.type === 'Identifier' && callee.name === 'createApp') {
          context.report({ node, messageId: 'useRegister' });
        }
      },
    };
  },
});
