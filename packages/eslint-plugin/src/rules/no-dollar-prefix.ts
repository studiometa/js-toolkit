import { isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

export const noDollarPrefix = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow user-defined methods and properties prefixed with "$" in Base subclasses — "$" is reserved for js-toolkit framework members',
    },
    messages: {
      noDollarPrefix:
        '"${{name}}" uses the "$" prefix, which is reserved for js-toolkit framework members. Rename it without the "$" prefix.',
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

  for (const member of node.body?.body ?? []) {
    if (member.static) continue;
    if (member.type !== 'MethodDefinition' && member.type !== 'PropertyDefinition') continue;
    const name: string = member.key?.name ?? '';
    if (name.startsWith('$')) {
      context.report({
        node: member.key,
        messageId: 'noDollarPrefix',
        data: { name: name.slice(1) },
      });
    }
  }
}
