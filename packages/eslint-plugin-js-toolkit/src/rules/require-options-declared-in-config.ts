import {
  isBaseSubclass,
  toCamelCase,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

function collectDeclaredOptions(classNode: Node): Set<string> {
  const body: Node[] = classNode.body?.body ?? [];
  const configProp = body.find(
    (m: Node) => m.type === 'PropertyDefinition' && m.static === true && m.key?.name === 'config',
  );

  if (!configProp?.value || configProp.value.type !== 'ObjectExpression') return new Set();

  const optionsProp = configProp.value.properties?.find(
    (p: Node) => p.type === 'Property' && p.key?.name === 'options',
  );

  if (!optionsProp?.value || optionsProp.value.type !== 'ObjectExpression') return new Set();

  const names = new Set<string>();
  for (const prop of optionsProp.value.properties ?? []) {
    if (prop.type !== 'Property') continue;
    const name = prop.key?.name ?? prop.key?.value;
    if (typeof name === 'string') {
      names.add(toCamelCase(name));
    }
  }
  return names;
}

/**
 * Returns true if `node` looks like `this.$options`.
 */
function isThisOptions(node: Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object?.type === 'ThisExpression' &&
    node.property?.name === '$options'
  );
}

export const requireOptionsDeclaredInConfig = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require all this.$options accesses to use option names declared in static config.options',
    },
    messages: {
      undeclared: 'Option "{{name}}" is not declared in static config.options.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      'ClassDeclaration, ClassExpression'(classNode: Node) {
        if (!isBaseSubclass(classNode, context)) return;

        const declared = collectDeclaredOptions(classNode);

        walkNode(classNode.body, (node: Node) => {
          if (node.type !== 'MemberExpression') return;
          if (!isThisOptions(node.object)) return;

          let name: string | null = null;

          if (!node.computed && node.property?.type === 'Identifier') {
            name = node.property.name;
          } else if (
            node.computed &&
            node.property?.type === 'Literal' &&
            typeof node.property.value === 'string'
          ) {
            name = toCamelCase(node.property.value);
          }

          if (name && !declared.has(name)) {
            context.report({
              node,
              messageId: 'undeclared',
              data: { name },
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
