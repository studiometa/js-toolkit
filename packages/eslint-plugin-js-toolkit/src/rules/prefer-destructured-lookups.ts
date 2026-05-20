import {
  findEnclosingClass,
  isBaseSubclass,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

const TRACKED_PROPERTIES = new Set(['$refs', '$options', '$children']);

function isTrackedLookup(node: Node): { prop: string; name: string } | null {
  if (
    node.type === 'MemberExpression' &&
    node.object?.type === 'MemberExpression' &&
    node.object.object?.type === 'ThisExpression' &&
    node.object.property?.type === 'Identifier' &&
    TRACKED_PROPERTIES.has(node.object.property.name) &&
    node.property?.type === 'Identifier' &&
    !node.computed
  ) {
    return { prop: node.object.property.name, name: node.property.name };
  }
  return null;
}

function findEnclosingMethod(ancestors: Node[]): Node | null {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    if (node.type === 'MethodDefinition') return node;
  }
  return null;
}

export const preferDestructuredLookups = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer destructuring this.$refs, this.$options and this.$children into local variables when accessed multiple times in the same method',
    },
    messages: {
      preferDestructured:
        '"this.{{prop}}.{{name}}" is accessed {{count}} times. Destructure it into a local variable to avoid repeated lookups.',
    },
  },
  createOnce(context: RuleContext) {
    // methodKey -> lookup key -> list of nodes
    const methodLookups = new Map<Node, Map<string, Node[]>>();

    return {
      MemberExpression(node: Node) {
        const match = isTrackedLookup(node);
        if (!match) return;

        const ancestors = context.getAncestors?.() ?? context.sourceCode?.getAncestors?.(node) ?? [];
        const method = findEnclosingMethod(ancestors);
        if (!method) return;

        const cls = findEnclosingClass(ancestors);
        if (!cls || !isBaseSubclass(cls, context)) return;

        if (!methodLookups.has(method)) methodLookups.set(method, new Map());
        const map = methodLookups.get(method)!;
        const key = `${match.prop}.${match.name}`;
        const list = map.get(key) ?? [];
        list.push(node);
        map.set(key, list);
      },

      'MethodDefinition:exit'(node: Node) {
        const map = methodLookups.get(node);
        if (!map) return;
        methodLookups.delete(node);

        for (const [key, nodes] of map) {
          if (nodes.length < 2) continue;
          const [prop, name] = key.split('.');
          context.report({
            node: nodes[0],
            messageId: 'preferDestructured',
            data: { prop, name, count: String(nodes.length) },
          });
        }
      },
    };
  },
});
