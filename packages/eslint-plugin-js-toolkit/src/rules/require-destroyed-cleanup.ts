import { isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

const SETUP_CALLS = new Set(['setTimeout', 'setInterval', 'requestAnimationFrame']);

export const requireDestroyedCleanup = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a destroyed() method in Base subclasses that use setTimeout, setInterval or requestAnimationFrame',
    },
    messages: {
      requireDestroyed:
        'This component uses {{calls}} but has no destroyed() method. Add destroyed() to clear timers and avoid memory leaks.',
    },
  },
  createOnce(context: RuleContext) {
    // class node -> set of timer call names found
    const classTimers = new Map<Node, Set<string>>();
    // class node -> whether destroyed() exists
    const classHasDestroyed = new Map<Node, boolean>();

    return {
      ClassDeclaration(node: Node) {
        classTimers.set(node, new Set());
        classHasDestroyed.set(node, false);
      },

      ClassExpression(node: Node) {
        classTimers.set(node, new Set());
        classHasDestroyed.set(node, false);
      },

      MethodDefinition(node: Node) {
        if (node.key?.name === 'destroyed') {
          // Find the enclosing class
          const sourceCode = context.sourceCode ?? context.getSourceCode?.();
          const ancestors =
            context.getAncestors?.() ?? sourceCode?.getAncestors?.(node) ?? [];
          for (let i = ancestors.length - 1; i >= 0; i--) {
            const a = ancestors[i];
            if (a.type === 'ClassDeclaration' || a.type === 'ClassExpression') {
              classHasDestroyed.set(a, true);
              break;
            }
          }
        }
      },

      CallExpression(node: Node) {
        if (node.callee?.type !== 'Identifier') return;
        if (!SETUP_CALLS.has(node.callee.name)) return;

        const sourceCode = context.sourceCode ?? context.getSourceCode?.();
        const ancestors =
          context.getAncestors?.() ?? sourceCode?.getAncestors?.(node) ?? [];

        for (let i = ancestors.length - 1; i >= 0; i--) {
          const a = ancestors[i];
          if (a.type === 'ClassDeclaration' || a.type === 'ClassExpression') {
            if (!isBaseSubclass(a, context)) break;
            classTimers.get(a)?.add(node.callee.name);
            break;
          }
        }
      },

      'ClassDeclaration:exit'(node: Node) {
        reportIfNeeded(node, context, classTimers, classHasDestroyed);
      },

      'ClassExpression:exit'(node: Node) {
        reportIfNeeded(node, context, classTimers, classHasDestroyed);
      },
    };
  },
});

function reportIfNeeded(
  node: Node,
  context: RuleContext,
  classTimers: Map<Node, Set<string>>,
  classHasDestroyed: Map<Node, boolean>,
) {
  const timers = classTimers.get(node);
  const hasDestroyed = classHasDestroyed.get(node);
  classTimers.delete(node);
  classHasDestroyed.delete(node);

  if (!timers || timers.size === 0) return;
  if (hasDestroyed) return;

  context.report({
    node: node.id ?? node,
    messageId: 'requireDestroyed',
    data: { calls: [...timers].join(', ') },
  });
}
