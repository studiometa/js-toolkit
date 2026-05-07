import { isBaseSubclass, type Node, type RuleContext } from '../utils/ast.ts';

export const requireConfig = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a static config property on classes extending Base',
    },
    messages: {
      missingConfig: 'Classes extending Base must define a static config property.',
      missingName: 'The static config must include a name property.',
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

  if (!configProp) {
    context.report({ node, messageId: 'missingConfig' });
    return;
  }

  // Check that config has a `name` property
  const value = configProp.value;
  if (!value || value.type !== 'ObjectExpression') return;

  const hasName = value.properties?.some(
    (prop: Node) =>
      prop.type === 'Property' && prop.key?.name === 'name' && prop.value?.value,
  );

  if (!hasName) {
    context.report({ node: configProp, messageId: 'missingName' });
  }
}
