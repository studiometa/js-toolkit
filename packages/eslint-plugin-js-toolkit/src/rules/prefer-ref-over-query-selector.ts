import {
  findEnclosingClass,
  isBaseSubclass,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

const QUERY_METHODS = new Set(['querySelector', 'querySelectorAll']);

function isThisEl(node: Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object?.type === 'ThisExpression' &&
    node.property?.name === '$el'
  );
}

export const preferRefOverQuerySelector = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer this.$refs over this.$el.querySelector() in Base subclasses',
    },
    messages: {
      preferRef:
        'Avoid "this.$el.{{method}}()". Declare a ref in static config and use "this.$refs" instead.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee?.type !== 'MemberExpression') return;
        if (!isThisEl(callee.object)) return;
        const method = callee.property?.name;
        if (!QUERY_METHODS.has(method)) return;

        const ancestors =
          context.getAncestors?.() ?? context.sourceCode?.getAncestors?.(node) ?? [];
        const cls = findEnclosingClass(ancestors);
        if (!cls || !isBaseSubclass(cls, context)) return;

        context.report({ node, messageId: 'preferRef', data: { method } });
      },
    };
  },
});
