import {
  isBaseSubclass,
  isPascalCase,
  toPascalCase,
  type Node,
  type RuleContext,
  createRule,
} from '../utils/ast.ts';

export const requireConfigNamePascalCase = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require config.name to be PascalCase on classes extending Base',
    },
    messages: {
      notPascalCase: 'config.name "{{name}}" must be PascalCase.',
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

  const nameProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'name',
  );

  if (!nameProp) return;

  const nameValue = nameProp.value?.value;
  if (typeof nameValue !== 'string') return;

  if (!isPascalCase(nameValue)) {
    context.report({
      node: nameProp.value,
      messageId: 'notPascalCase',
      data: { name: nameValue },
      fix: (fixer: any) => fixer.replaceText(nameProp.value, `'${toPascalCase(nameValue)}'`),
    });
  }
}
