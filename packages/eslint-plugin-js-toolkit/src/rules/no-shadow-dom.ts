import { findEnclosingClass, isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const noShadowDom = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow attachShadow() in Base subclasses — js-toolkit uses Light DOM only',
    },
    messages: {
      noShadow:
        'Do not use attachShadow() in a Base component. @studiometa/js-toolkit uses Light DOM only.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (
          callee.type !== 'MemberExpression' ||
          callee.property?.name !== 'attachShadow'
        ) {
          return;
        }

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({ node, messageId: 'noShadow' });
      },
    };
  },
});
