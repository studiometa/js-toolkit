import {
  isBaseSubclass,
  toCamelCase,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

function collectDeclaredRefs(classNode: Node): Set<string> {
  const body: Node[] = classNode.body?.body ?? [];
  const configProp = body.find(
    (m: Node) => m.type === 'PropertyDefinition' && m.static === true && m.key?.name === 'config',
  );

  if (!configProp?.value || configProp.value.type !== 'ObjectExpression') return new Set();

  const refsProp = configProp.value.properties?.find(
    (p: Node) => p.type === 'Property' && p.key?.name === 'refs',
  );

  if (!refsProp?.value || refsProp.value.type !== 'ArrayExpression') return new Set();

  const names = new Set<string>();
  for (const el of refsProp.value.elements ?? []) {
    if (!el || el.type !== 'Literal' || typeof el.value !== 'string') continue;
    const raw: string = el.value;
    const stripped = raw.endsWith('[]') ? raw.slice(0, -2) : raw;
    names.add(toCamelCase(stripped));
  }
  return names;
}

function isThisRefs(node: Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object?.type === 'ThisExpression' &&
    node.property?.name === '$refs'
  );
}

export const requireRefsDeclaredInConfig = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Require all this.$refs accesses to be declared in static config.refs',
    },
    messages: {
      undeclared: 'Ref "{{name}}" is not declared in static config.refs.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      'ClassDeclaration, ClassExpression'(classNode: Node) {
        if (!isBaseSubclass(classNode, context)) return;

        const declared = collectDeclaredRefs(classNode);

        // Walk the class body looking for this.$refs.<name> accesses
        walkNode(classNode.body, (node: Node) => {
          if (node.type !== 'MemberExpression') return;
          if (!isThisRefs(node.object)) return;

          let refName: string | null = null;

          if (!node.computed && node.property?.type === 'Identifier') {
            refName = node.property.name;
          } else if (
            node.computed &&
            node.property?.type === 'Literal' &&
            typeof node.property.value === 'string'
          ) {
            const raw: string = node.property.value;
            const stripped = raw.endsWith('[]') ? raw.slice(0, -2) : raw;
            refName = toCamelCase(stripped);
          }

          if (refName && !declared.has(refName)) {
            context.report({
              node,
              messageId: 'undeclared',
              data: { name: refName },
            });
          }
        });
      },
    };
  },
});

function walkNode(node: Node, visit: (n: Node) => void) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) walkNode(item, visit);
    } else if (child && typeof child === 'object' && child.type) {
      walkNode(child, visit);
    }
  }
}
