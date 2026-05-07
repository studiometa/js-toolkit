import { type Node, type RuleContext } from '../utils/ast.ts';

export const noRedundantWithMountWhenInView = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow wrapping withMountWhenInView inside withScrolledInView (redundant)',
    },
    messages: {
      redundant:
        'withScrolledInView already includes withMountWhenInView internally. Remove the inner withMountWhenInView call.',
    },
  },
  create(context: RuleContext) {
    return {
      'ClassDeclaration, ClassExpression'(node: Node) {
        check(node, context);
      },
    };
  },
};

function check(node: Node, context: RuleContext) {
  const superClass = node.superClass;
  if (!superClass || superClass.type !== 'CallExpression') return;
  if (superClass.callee?.name !== 'withScrolledInView') return;

  const arg = superClass.arguments?.[0];
  if (!arg || arg.type !== 'CallExpression') return;
  if (arg.callee?.name !== 'withMountWhenInView') return;

  context.report({ node: superClass, messageId: 'redundant' });
}
