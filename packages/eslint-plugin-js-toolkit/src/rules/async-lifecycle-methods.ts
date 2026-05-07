import {
  isBaseSubclass,
  LIFECYCLE_METHODS,
  findEnclosingClass,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

export const asyncLifecycleMethods = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require lifecycle methods on Base subclasses to be async',
    },
    messages: {
      notAsync: 'Lifecycle method "{{name}}" must be declared as async.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      MethodDefinition(node: Node) {
        const name = node.key?.name;
        if (!name || !LIFECYCLE_METHODS.has(name)) return;
        if (node.value?.async) return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : (context.sourceCode?.getAncestors?.(node) ?? []);

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({
          node,
          messageId: 'notAsync',
          data: { name },
          fix: (fixer: any) => fixer.insertTextBefore(node.key, 'async '),
        });
      },
    };
  },
});
