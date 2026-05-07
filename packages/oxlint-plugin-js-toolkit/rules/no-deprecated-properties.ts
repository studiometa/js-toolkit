import { isBaseSubclass, findEnclosingClass, type Node, type RuleContext } from '../utils/ast.js';

const REMOVED = new Map([
  ['$parent', '$closest()'],
  ['$root', '$closest()'],
]);

const DEPRECATED = new Map([
  ['$children', '$query() or $queryAll()'],
]);

export const noDeprecatedProperties = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow removed or deprecated Base properties ($parent, $children, $root)',
    },
    messages: {
      removed: '"{{name}}" was removed in v3. Use {{replacement}} instead.',
      deprecated: '"{{name}}" is deprecated. Use {{replacement}} instead.',
    },
  },
  create(context: RuleContext) {
    return {
      MemberExpression(node: Node) {
        const prop = node.property?.name;
        if (!prop || (!REMOVED.has(prop) && !DEPRECATED.has(prop))) return;

        // Only flag `this.$parent` etc. — not arbitrary object access
        if (node.object?.type !== 'ThisExpression') return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        const messageId = REMOVED.has(prop) ? 'removed' : 'deprecated';
        const replacement = REMOVED.get(prop) ?? DEPRECATED.get(prop);
        context.report({
          node,
          messageId,
          data: { name: prop, replacement },
        });
      },
    };
  },
};
