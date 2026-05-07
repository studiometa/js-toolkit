import { isBaseSubclass, findEnclosingClass, type Node, type RuleContext } from '../utils/ast.ts';

const DEPRECATED = new Map([
  ['$parent', '$closest()'],
  ['$root', '$closest()'],
  ['$children', '$query()'],
]);

export const noDeprecatedProperties = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated Base properties ($parent, $children, $root)',
    },
    messages: {
      deprecated: '"{{name}}" is deprecated. Use {{replacement}} instead.',
    },
  },
  create(context: RuleContext) {
    return {
      MemberExpression(node: Node) {
        const prop = node.property?.name;
        if (!prop || !DEPRECATED.has(prop)) return;

        // Only flag `this.$parent` etc. — not arbitrary object access
        if (node.object?.type !== 'ThisExpression') return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        const replacement = DEPRECATED.get(prop);
        context.report({
          node,
          messageId: 'deprecated',
          data: { name: prop, replacement },
        });
      },
    };
  },
};
