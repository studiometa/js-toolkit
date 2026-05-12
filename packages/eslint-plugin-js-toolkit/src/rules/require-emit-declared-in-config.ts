import { isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

function collectDeclaredEmits(classNode: Node): Set<string> {
  const body: Node[] = classNode.body?.body ?? [];
  const configProp = body.find(
    (m: Node) => m.type === 'PropertyDefinition' && m.static === true && m.key?.name === 'config',
  );

  if (!configProp?.value || configProp.value.type !== 'ObjectExpression') return new Set();

  const emitsProp = configProp.value.properties?.find(
    (p: Node) => p.type === 'Property' && p.key?.name === 'emits',
  );

  if (!emitsProp?.value || emitsProp.value.type !== 'ArrayExpression') return new Set();

  const names = new Set<string>();
  for (const el of emitsProp.value.elements ?? []) {
    if (el?.type === 'Literal' && typeof el.value === 'string') {
      names.add(el.value);
    }
  }
  return names;
}

/**
 * Returns true if `node` looks like `this.$emit`.
 */
function isThisEmit(node: Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object?.type === 'ThisExpression' &&
    node.property?.name === '$emit'
  );
}

export const requireEmitDeclaredInConfig = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require all this.$emit() calls to use event names declared in static config.emits',
    },
    messages: {
      undeclared: 'Emit "{{name}}" is not declared in static config.emits.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      'ClassDeclaration, ClassExpression'(classNode: Node) {
        if (!isBaseSubclass(classNode, context)) return;

        const declared = collectDeclaredEmits(classNode);

        walkNode(classNode.body, (node: Node) => {
          // Match: this.$emit('event-name', ...)
          if (node.type !== 'CallExpression') return;
          if (!isThisEmit(node.callee)) return;

          const firstArg = node.arguments?.[0];
          if (!firstArg || firstArg.type !== 'Literal') return;
          const name = firstArg.value;
          if (typeof name !== 'string') return;

          if (!declared.has(name)) {
            context.report({
              node: firstArg,
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
