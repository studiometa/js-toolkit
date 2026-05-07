import { findEnclosingClass, isBaseSubclass, type Node, type RuleContext } from '../utils/ast.js';

const FORBIDDEN = new Set(['addEventListener', 'removeEventListener']);

export const noEventListenerMethods = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow addEventListener/removeEventListener in Base subclasses — use on* methods instead',
    },
    messages: {
      useOnMethod:
        '"{{method}}()" should not be used in a Base component. ' +
        'Define an "on<Target><Event>()" method instead — the framework handles binding and cleanup automatically.',
    },
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee.type !== 'MemberExpression') return;

        const method = callee.property?.name;
        if (!method || !FORBIDDEN.has(method)) return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({ node, messageId: 'useOnMethod', data: { method } });
      },
    };
  },
};
