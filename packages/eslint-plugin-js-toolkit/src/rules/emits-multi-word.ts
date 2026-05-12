import { isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

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

  const emitsProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'emits',
  );

  if (!emitsProp?.value || emitsProp.value.type !== 'ArrayExpression') return;

  for (const element of emitsProp.value.elements ?? []) {
    if (!element || element.type !== 'Literal') continue;
    const name = element.value;
    if (typeof name !== 'string') continue;
    if (!name.includes('-')) {
      context.report({
        node: element,
        messageId: 'singleWord',
        data: { name },
      });
    }
  }
}

export const emitsMultiWord = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require emit names in static config to be multi-word to avoid collision with native DOM events',
    },
    messages: {
      singleWord:
        'Emit name "{{name}}" must be multi-word (e.g. "item-click" instead of "click") to avoid collisions with native DOM events.',
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
