import { findEnclosingClass, isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const noDispatchEvent = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow dispatchEvent() in Base subclasses — use this.$emit() instead',
    },
    messages: {
      useEmit: 'Use this.$emit() instead of dispatchEvent() to emit events in a Base component.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;

        const isDispatchEvent =
          // this.dispatchEvent(...)
          (callee.type === 'MemberExpression' &&
            callee.object?.type === 'ThisExpression' &&
            callee.property?.name === 'dispatchEvent') ||
          // this.$el.dispatchEvent(...) or el.dispatchEvent(...)
          (callee.type === 'MemberExpression' &&
            callee.property?.name === 'dispatchEvent');

        if (!isDispatchEvent) return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({ node, messageId: 'useEmit' });
      },
    };
  },
});
