import { isBaseSubclass, isCamelCase, toCamelCase, type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const optionsCamelCase = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require option keys in static config to be camelCase',
    },
    messages: {
      notCamelCase: 'Option key "{{name}}" must be camelCase.',
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

  const optionsProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'options',
  );

  if (!optionsProp?.value || optionsProp.value.type !== 'ObjectExpression') return;

  for (const prop of optionsProp.value.properties ?? []) {
    if (prop.type !== 'Property') continue;
    const name = prop.key?.name ?? prop.key?.value;
    if (typeof name !== 'string') continue;
    if (!isCamelCase(name)) {
      const fixed = toCamelCase(name);
      // Quoted key ('slides-to-show') vs identifier key (SlidesToShow)
      const fixedText = prop.key.type === 'Literal' ? `'${fixed}'` : fixed;
      context.report({
        node: prop.key,
        messageId: 'notCamelCase',
        data: { name },
        fix: (fixer: any) => fixer.replaceText(prop.key, fixedText),
      });
    }
  }
}
