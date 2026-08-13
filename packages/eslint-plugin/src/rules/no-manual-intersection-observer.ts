import {
  findEnclosingClass,
  isBaseSubclass,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

export const noManualIntersectionObserver = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow manual IntersectionObserver inside Base subclasses; use withIntersectionObserver or withMountWhenInView instead',
    },
    messages: {
      noManual:
        'Avoid manual "new IntersectionObserver()". Use "withIntersectionObserver" or "withMountWhenInView" decorators instead.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      NewExpression(node: Node) {
        if (node.callee?.name !== 'IntersectionObserver') return;

        const ancestors =
          context.getAncestors?.() ?? context.sourceCode?.getAncestors?.(node) ?? [];
        const cls = findEnclosingClass(ancestors);
        if (!cls || !isBaseSubclass(cls, context)) return;

        context.report({ node, messageId: 'noManual' });
      },
    };
  },
});
