import { isBaseSubclass, isCamelCase, type Node, type RuleContext } from '../utils/ast.js';

export const optionsCamelCase = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require option keys in static config to be camelCase',
    },
    messages: {
      notCamelCase: 'Option key "{{name}}" must be camelCase.',
    },
  },
  create(context: RuleContext) {
    return {
      ClassDeclaration(node: Node) {
        check(node, context);
      },
      ClassExpression(node: Node) {
        check(node, context);
      },
    };
  },
};

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
      context.report({
        node: prop.key,
        messageId: 'notCamelCase',
        data: { name },
      });
    }
  }
}
