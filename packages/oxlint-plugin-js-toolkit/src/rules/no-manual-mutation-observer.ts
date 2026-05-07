import { findEnclosingClass, isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const noManualMutationObserver = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow manual MutationObserver inside Base subclasses; use withMutation decorator instead',
    },
    messages: {
      noManual:
        'Avoid manual "new MutationObserver()". Use the "withMutation" decorator instead.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      NewExpression(node: Node) {
        if (node.callee?.name !== 'MutationObserver') return;

        const ancestors = context.getAncestors?.() ?? context.sourceCode?.getAncestors?.(node) ?? [];
        const cls = findEnclosingClass(ancestors);
        if (!cls || !isBaseSubclass(cls, context)) return;

        context.report({ node, messageId: 'noManual' });
      },
    };
  },
});
