import {
  isBaseSubclass,
  isPascalCase,
  toPascalCase,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

function check(node: Node, context: RuleContext) {
  if (!isBaseSubclass(node, context)) return;

  const body: Node[] = node.body?.body ?? [];

  const configProp = body.find(
    (member: Node) =>
      member.type === 'PropertyDefinition' &&
      member.static === true &&
      member.key?.name === 'config',
  );

  if (!configProp?.value || configProp.value.type !== 'ObjectExpression') return;

  const componentsProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'components',
  );

  if (!componentsProp?.value || componentsProp.value.type !== 'ObjectExpression') return;

  for (const prop of componentsProp.value.properties ?? []) {
    if (prop.type !== 'Property') continue;
    const name = prop.key?.name ?? prop.key?.value;
    if (typeof name !== 'string') continue;
    if (!isPascalCase(name)) {
      const fixed = toPascalCase(name);
      const fixedText = prop.key.type === 'Literal' ? `'${fixed}'` : fixed;
      context.report({
        node: prop.key,
        messageId: 'notPascalCase',
        data: { name },
        fix: (fixer: any) => fixer.replaceText(prop.key, fixedText),
      });
    }
  }
}

export const componentsPascalCase = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require component keys in static config to be PascalCase',
    },
    messages: {
      notPascalCase:
        'Component key "{{name}}" must be PascalCase (e.g. "MyComponent").',
    },
  },
  createOnce(context: RuleContext) {
    return {
      ClassDeclaration(node: Node) {
        check(node, context);
      },
      ClassExpression(node: Node) {
        check(node, context);
      },
    };
  },
});
